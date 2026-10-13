import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { DiscoveredApp } from "./discover";
import type { MpEnvConfig, MpEnvItem } from "./types";

type RuntimeEnvConfig = MpEnvConfig<Record<string, Record<string, unknown>>>;

/** 环境名保留字：common 为共享配置键，all 为 CLI 批量关键字 */
const RESERVED_ENV_NAMES = ["common", "all"];

/** 单次环境切换的执行结果 */
export interface SwitchResult {
  /** 生成的 config.ts 绝对路径 */
  configFile: string;
  /** 是否清理了旧的产物 config.js */
  removedLegacyJs: boolean;
  /** appid 同步信息，未同步时为 null */
  appidSync: { from: string; to: string } | null;
}

/**
 * 加载并校验 app 的 env.config 默认导出
 * 结构非法时抛出带文件路径上下文的 Error
 */
export async function loadEnvConfig(
  configFile: string,
): Promise<RuntimeEnvConfig> {
  const mod = (await import(pathToFileURL(configFile).href)) as {
    default?: unknown;
  };
  const data = mod.default;

  if (!isPlainObject(data)) {
    throw new Error(`${configFile} 默认导出必须是对象`);
  }
  if (!isPlainObject(data.envs)) {
    throw new Error(`${configFile} 默认导出的 envs 必须是对象`);
  }

  const envs = data.envs;
  const envNames = Object.keys(envs).filter((key) => key !== "common");
  if (envNames.length === 0) {
    throw new Error(`${configFile} 至少需要定义一个环境（不能只有 common）`);
  }
  for (const key of Object.keys(envs)) {
    if (key !== "common" && RESERVED_ENV_NAMES.includes(key)) {
      throw new Error(`${configFile} 环境名 "${key}" 是保留字，请换一个名称`);
    }
    if (!isPlainObject(envs[key])) {
      throw new Error(`${configFile} 中 "${key}" 的值必须是对象`);
    }
  }
  return {
    envs: envs as Record<string, Record<string, unknown>>,
  };
}

/** 获取配置中可用的环境名列表（排除 common，保持定义顺序） */
export function listEnvNames(config: RuntimeEnvConfig): string[] {
  return Object.keys(config.envs).filter((key) => key !== "common");
}

/**
 * 合并 common 与目标环境（浅合并，目标环境同名字段覆盖）
 * 环境不存在或为保留字时抛出列出可用环境的 Error
 */
export function mergeEnv(
  config: RuntimeEnvConfig,
  env: string,
): Record<string, unknown> {
  const { envs } = config;
  if (RESERVED_ENV_NAMES.includes(env) || !Object.hasOwn(envs, env)) {
    throw new Error(
      `无效的环境 "${env}"，可用环境: ${listEnvNames(config).join(", ") || "（无）"}`,
    );
  }
  return { ...envs.common, ...envs[env] };
}

/** 生成 config.ts 文件内容（2 空格缩进，key 为合法标识符时去引号，末属性带尾随逗号） */
export function renderConfigFile(
  merged: Record<string, unknown>,
  env: string,
): string {
  const body = JSON.stringify(merged, null, 2)
    .replace(/^(\s*)"([^"]+)":/gm, (_, indent: string, key: string) =>
      /^[A-Za-z_$][\w$]*$/.test(key)
        ? `${indent}${key}:`
        : `${indent}"${key}":`,
    )
    .replace(/\n\}$/, ",\n}");
  return `/**
 * 【自动生成文件，请勿手动修改】
 * 生成工具: packages/mp-env
 * 当前环境: ${env}
 */
export default Object.freeze(${body});
`;
}

/** 从已生成的 config.ts 头部读取当前环境标记，无文件或无标记返回 null */
export function readCurrentEnv(appDir: string): string | null {
  const configPath = path.join(appDir, "config.ts");
  if (!fs.existsSync(configPath)) return null;
  const match = fs
    .readFileSync(configPath, "utf-8")
    .match(/^\s*\*\s*当前环境:\s*(\S+)\s*$/m);
  return match ? match[1] : null;
}

/**
 * 执行一次环境切换：加载校验 → 合并 → 生成 config.ts →
 * 清理 config.js → 按 APPID 字段同步 project.config.json
 */
export async function switchEnv(
  app: DiscoveredApp,
  env: string,
): Promise<SwitchResult> {
  const config = await loadEnvConfig(app.configFile);
  const merged = mergeEnv(config, env);

  const configFilePath = path.join(app.dir, "config.ts");
  fs.writeFileSync(configFilePath, renderConfigFile(merged, env), "utf-8");

  const legacyJsPath = path.join(app.dir, "config.js");
  const removedLegacyJs = fs.existsSync(legacyJsPath);
  if (removedLegacyJs) {
    fs.unlinkSync(legacyJsPath);
  }

  return {
    configFile: configFilePath,
    removedLegacyJs,
    appidSync: syncAppid(app.dir, merged),
  };
}

/** 将合并配置中的 APPID 字段同步到 project.config.json，失败时警告并跳过 */
function syncAppid(
  appDir: string,
  merged: Record<string, unknown>,
): { from: string; to: string } | null {
  const appid = merged.APPID;
  if (typeof appid !== "string") return null;

  const projectConfigPath = path.join(appDir, "project.config.json");
  if (!fs.existsSync(projectConfigPath)) return null;

  let projectConfig: unknown;
  try {
    projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, "utf-8"));
  } catch (err) {
    console.warn(
      `警告: 解析 ${projectConfigPath} 失败，跳过 appid 同步: ${(err as Error).message}`,
    );
    return null;
  }
  if (!isPlainObject(projectConfig)) return null;

  const from =
    typeof projectConfig.appid === "string" ? projectConfig.appid : "";
  if (from === appid) return null;

  projectConfig.appid = appid;
  fs.writeFileSync(
    projectConfigPath,
    JSON.stringify(projectConfig, null, 2),
    "utf-8",
  );
  return { from, to: appid };
}

/** 是否为普通对象（非 null、非数组） */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
