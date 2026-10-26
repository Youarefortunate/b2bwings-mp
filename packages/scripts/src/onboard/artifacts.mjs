import fs from "node:fs/promises";
import path from "node:path";
import { checkInterrupted } from "./interruption.mjs";

const UTILS_PACKAGE = "xbd-utils";
const COMPONENTS_PACKAGE = "xbd-miniprogram";

/** 产物分发目录，均相对仓库根 */
const utilsPackageDirectory = "packages/utils";
const componentSourceDirectory = "packages/components";
const componentDistDirectory = "packages/miniprogram/miniprogram_dist";

/** 组件构建在任意层级排除的目录，与 gulp 的 ignore 规则一致 */
const excludedDirectories = new Set([
  "__test__",
  "__tests__",
  "tests",
  "_example",
  "node_modules",
]);

/** 原样分发的源码扩展名 */
const passthroughExtensions = new Set([
  ".js",
  ".wxs",
  ".json",
  ".wxml",
  ".wxss",
]);

/** exports 入口当前支持的条件字段 */
const supportedConditions = new Set(["default", "types"]);

const failure = (message, cause) =>
  new Error(message, cause === undefined ? undefined : { cause });

const requirement = (value, label) => {
  if (typeof value !== "string" || value.length === 0) {
    throw failure(
      `${UTILS_PACKAGE} package.json ${label} 必须是非空字符串路径`,
    );
  }
  return value;
};

/** 目标必须是包内相对路径，且不能是通配映射或逃出包目录 */
const resolveInsidePackage = (packageRoot, target, label) => {
  if (target.includes("*")) {
    throw failure(`${UTILS_PACKAGE} ${label} 不支持通配路径：${target}`);
  }
  if (!target.startsWith("./")) {
    throw failure(`${UTILS_PACKAGE} ${label} 必须是包内相对路径：${target}`);
  }
  const resolved = path.resolve(packageRoot, target);
  const relative = path.relative(packageRoot, resolved);
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw failure(`${UTILS_PACKAGE} ${label} 越出包目录：${target}`);
  }
  return resolved;
};

const assertJavaScriptTarget = (target, label) => {
  if (!target.endsWith(".js")) {
    throw failure(`${UTILS_PACKAGE} ${label} 必须指向 .js 文件：${target}`);
  }
};

const assertTypesTarget = (target, label) => {
  if (!target.endsWith(".d.ts")) {
    throw failure(`${UTILS_PACKAGE} ${label} 必须指向 .d.ts 文件：${target}`);
  }
};

/**
 * 从包声明解析公开入口的必要产物路径，入口集合完全来自 package.json，
 * 不维护固定名单；缺失必要字段、空入口、通配或不支持的映射时直接失败
 * @param {string} root 仓库根目录
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<string[]>} 必要的绝对文件路径，去重并排序
 */
export async function discoverUtilsArtifacts(root, { signal } = {}) {
  checkInterrupted(signal);
  const packageRoot = path.join(root, utilsPackageDirectory);
  const manifestPath = path.join(packageRoot, "package.json");
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (error) {
    throw failure(
      `${UTILS_PACKAGE} 读取或解析 package.json 失败：${error.message}`,
      error,
    );
  }
  checkInterrupted(signal);

  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest)
  ) {
    throw failure(`${UTILS_PACKAGE} package.json 必须是对象`);
  }

  const exports = manifest.exports;
  if (!exports || typeof exports !== "object" || Array.isArray(exports)) {
    throw failure(
      `${UTILS_PACKAGE} package.json exports 必须是以子路径为键的对象`,
    );
  }
  const entries = Object.entries(exports);
  if (entries.length === 0) {
    throw failure(`${UTILS_PACKAGE} package.json exports 不能为空`);
  }

  const targets = new Map();
  const collect = (target, label, validate) => {
    const resolved = resolveInsidePackage(packageRoot, target, label);
    validate(target, label);
    if (!targets.has(resolved)) targets.set(resolved, true);
  };

  collect(requirement(manifest.main, "main"), "main", assertJavaScriptTarget);
  collect(requirement(manifest.types, "types"), "types", assertTypesTarget);

  for (const [key, value] of entries) {
    const label = `exports 入口 ${key}`;
    if (key.includes("*")) {
      throw failure(`${UTILS_PACKAGE} ${label} 不支持通配入口`);
    }
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw failure(`${UTILS_PACKAGE} ${label} 必须是条件对象`);
    }
    for (const condition of Object.keys(value)) {
      if (!supportedConditions.has(condition)) {
        throw failure(
          `${UTILS_PACKAGE} ${label} 使用了不支持的条件：${condition}`,
        );
      }
    }
    if (!("default" in value) || !("types" in value)) {
      throw failure(`${UTILS_PACKAGE} ${label} 必须同时声明 default 与 types`);
    }
    collect(
      requirement(value.default, `${label} default`),
      `${label} default`,
      assertJavaScriptTarget,
    );
    collect(
      requirement(value.types, `${label} types`),
      `${label} types`,
      assertTypesTarget,
    );
  }

  return [...targets.keys()].sort();
}

const isHiddenName = (name) => name.startsWith(".");

/**
 * 将参与分发构建的组件源码映射到必要运行文件：TS→JS、SCSS→WXSS，
 * js/wxs/json/wxml/wxss 原路径输出；Sass partial、声明文件、Markdown、
 * 图片等不在此必要集合内
 */
const componentArtifactRelativePath = (relativePath) => {
  const name = path.posix.basename(relativePath);
  if (name.endsWith(".d.ts")) return null;
  const extension = path.posix.extname(name);
  if (extension === ".ts") return `${relativePath.slice(0, -3)}.js`;
  if (extension === ".scss") {
    if (name.startsWith("_")) return null; // Sass partial
    return `${relativePath.slice(0, -5)}.wxss`;
  }
  if (passthroughExtensions.has(extension)) return relativePath;
  return null;
};

const isExcludedComponentPath = (relativePath) =>
  relativePath === "package.json" || relativePath.endsWith("/package.json");

/**
 * 从参与分发构建的组件源码发现必要运行文件，排除测试、示例、
 * node_modules 与 package.json，icons 子树的运行源码仍纳入
 * 不跟随目录链接，隐藏路径只在 JSON 的 dot 行为下纳入
 * @param {string} root 仓库根目录
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<string[]>} 必要的绝对文件路径，去重并排序
 */
export async function discoverComponentArtifacts(root, { signal } = {}) {
  checkInterrupted(signal);
  const sourceRoot = path.join(root, componentSourceDirectory);
  const distRoot = path.join(root, componentDistDirectory);
  const artifacts = new Set();

  const scan = async (directory, prefix, inHidden) => {
    checkInterrupted(signal);
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      throw failure(
        `${COMPONENTS_PACKAGE} 扫描 ${path.relative(root, directory)} 失败（${error.code ?? "未知错误"}）：${error.message}`,
        error,
      );
    }
    entries.sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    );
    for (const entry of entries) {
      checkInterrupted(signal);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) continue;
      const hidden = inHidden || isHiddenName(entry.name);
      if (entry.isDirectory()) {
        if (excludedDirectories.has(entry.name)) continue;
        await scan(path.join(directory, entry.name), relativePath, hidden);
        continue;
      }
      if (!entry.isFile()) continue;
      // 普通 glob 不匹配隐藏源码，仅 JSON 任务使用 dot 行为保留隐藏路径
      if (hidden && path.posix.extname(entry.name) !== ".json") continue;
      if (isExcludedComponentPath(relativePath)) continue;
      const artifact = componentArtifactRelativePath(relativePath);
      if (artifact) artifacts.add(artifact);
    }
  };

  await scan(sourceRoot, "", false);
  if (artifacts.size === 0) {
    throw failure(
      `${COMPONENTS_PACKAGE} 未发现参与分发构建的组件源码，无法判定产物齐全`,
    );
  }
  return [...artifacts].map((relative) => path.join(distRoot, relative)).sort();
}

/**
 * 公共文件检查：不存在的路径（含中间节点不是目录）与服务目录占用视为缺失，
 * 其他文件系统错误保留原始原因并附公共包与路径直接失败
 * @param {string[]} files 必要产物的绝对路径
 * @param {{ signal?: AbortSignal, label?: string }} [options]
 * @returns {Promise<string[]>} 缺失或不是普通文件的路径
 */
export async function findMissingArtifacts(files, { signal, label } = {}) {
  if (files.length === 0) {
    throw failure("必要产物清单为空，不能判定为齐全");
  }
  checkInterrupted(signal);
  const prefix = label ? `${label} ` : "";
  const missing = [];
  for (const file of files) {
    checkInterrupted(signal);
    let stats;
    try {
      stats = await fs.stat(file);
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") {
        missing.push(file);
        continue;
      }
      throw failure(
        `${prefix}必要产物 ${file} 检查失败（${error.code ?? "未知错误"}）：${error.message}`,
        error,
      );
    }
    if (!stats.isFile()) missing.push(file);
  }
  return missing;
}
