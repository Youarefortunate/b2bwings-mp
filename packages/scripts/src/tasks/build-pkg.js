const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const Terser = require("terser");
const { resolvePath } = require("../utils/paths");

const rawArgs = process.argv.slice(2);
const isWatch = rawArgs.includes("--watch");
const packageDir = process.cwd();

/** 将短横线命令行参数名转换为 esbuild 使用的驼峰属性名 */
function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/** 将命令行字符串转换为布尔值、数字、JSON 或普通字符串 */
function parseValue(value) {
  if (value === undefined) return true;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]"))
  ) {
    return JSON.parse(value);
  }

  return value;
}

/** 追加 esbuild 参数；同名参数多次出现时自动合并为数组 */
function appendOption(options, key, value) {
  if (!(key in options)) {
    options[key] = value;
    return;
  }

  options[key] = Array.isArray(options[key])
    ? [...options[key], value]
    : [options[key], value];
}

/** 解析构建脚本控制参数及可动态覆盖的 esbuild 参数 */
function parseArguments(args) {
  const controls = {
    formats: undefined,
    syncMiniprogram: true,
    terser: true,
  };
  const options = {};

  for (const argument of args) {
    if (!argument.startsWith("--") || argument === "--watch") continue;

    const separatorIndex = argument.indexOf("=");
    const rawKey = argument.slice(
      2,
      separatorIndex === -1 ? undefined : separatorIndex,
    );
    const rawValue =
      separatorIndex === -1 ? undefined : argument.slice(separatorIndex + 1);
    const key = toCamelCase(rawKey);
    const value = parseValue(rawValue);

    if (key === "formats") {
      controls.formats = String(value)
        .split(",")
        .map((format) => format.trim())
        .filter(Boolean);
      continue;
    }

    if (key === "syncMiniprogram" || key === "terser") {
      controls[key] = Boolean(value);
      continue;
    }

    const colonIndex = key.indexOf(":");
    if (colonIndex === -1) {
      appendOption(options, key, value);
      continue;
    }

    const optionName = key.slice(0, colonIndex);
    const propertyName = key.slice(colonIndex + 1);
    options[optionName] = {
      ...(options[optionName] ?? {}),
      [propertyName]: value,
    };
  }

  return { controls, options };
}

/** 读取当前工作区包信息和包级构建配置 */
function readPackageContext() {
  const packageJsonPath = path.resolve(packageDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`[build] 找不到 package.json: ${packageJsonPath}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return {
    packageName: packageJson.name,
    packageBuildOptions: packageJson.xbdBuild ?? {},
  };
}

const { controls, options: cliOptions } = parseArguments(rawArgs);
const { packageName, packageBuildOptions } = readPackageContext();
const configuredOptions = { ...packageBuildOptions, ...cliOptions };

const defaultOptions = {
  // 打包的入口文件，默认指向各子包的 src/index.ts
  entryPoints: [path.resolve(packageDir, "src/index.ts")],
  // 开启依赖项打包，将所有导入的依赖打包入单文件中
  bundle: true,
  // 目标运行平台设定为 neutral 通用平台
  platform: "neutral",
  // 输出模块格式设定为 CommonJS，以完美适配微信小程序 npm 加载机制
  format: "cjs",
  // 编译目标的 JS 语法版本，设为 es2016 保证小程序运行环境兼容性
  target: "es2016",
  // 打包产物的输出物理绝对路径，默认指向各子包的 dist/index.js
  outfile: path.resolve(packageDir, "dist/index.js"),
  // 是否生成用于定位源码调试的 sourcemap 映射文件
  sourcemap: true,
  // 生产环境自动压缩以缩减小程序包体积（开发模式保持原样方便调试）
  minify: !isWatch,
  // 生产环境擦除所有版权及法律声明注释以减少体积（开发模式下保留）
  legalComments: isWatch ? "inline" : "none",
  // 生产环境自动擦除 console 日志与 debugger 语句以优化性能与安全性（开发模式保留）
  drop: isWatch ? [] : ["console", "debugger"],
};

/** 将单文件或目录构建产物同步到依赖当前包的小程序项目 */
function copyToMiniprogramNpm(sourcePath) {
  if (!controls.syncMiniprogram || !fs.existsSync(sourcePath)) return;

  const appsDir = resolvePath("apps");
  if (!fs.existsSync(appsDir)) return;

  const sourceIsDirectory = fs.statSync(sourcePath).isDirectory();

  for (const appName of fs.readdirSync(appsDir)) {
    const appPath = path.resolve(appsDir, appName);
    const packageJsonPath = path.resolve(appPath, "package.json");
    if (
      !fs.statSync(appPath).isDirectory() ||
      !fs.existsSync(packageJsonPath)
    ) {
      continue;
    }

    try {
      const appPackage = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (!appPackage.dependencies?.[packageName]) continue;

      const destination = path.resolve(
        appPath,
        `miniprogram_npm/${packageName}`,
      );
      fs.rmSync(destination, { recursive: true, force: true });
      fs.mkdirSync(destination, { recursive: true });

      if (sourceIsDirectory) {
        fs.cpSync(sourcePath, destination, { recursive: true });
      } else {
        const destinationFile = path.resolve(destination, "index.js");
        fs.copyFileSync(sourcePath, destinationFile);

        const sourceMap = `${sourcePath}.map`;
        if (fs.existsSync(sourceMap)) {
          fs.copyFileSync(sourceMap, `${destinationFile}.map`);
        }
      }

      console.log(
        `[build] 已自动同步构建产物至 apps/${appName}/miniprogram_npm/${packageName}`,
      );
    } catch (error) {
      console.warn(`[build] 解析 apps/${appName}/package.json 失败:`, error);
    }
  }
}

/** 创建监听构建完成后同步小程序产物的 esbuild 插件 */
function createWatchSyncPlugin(outputPath) {
  return {
    name: "sync-miniprogram-on-watch",
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length === 0) copyToMiniprogramNpm(outputPath);
      });
    },
  };
}

/** 按模块格式合并默认、包级和命令行构建配置 */
function createBuildOptions(format) {
  const hasOutfile = Object.hasOwn(configuredOptions, "outfile");
  const hasOutdir = Object.hasOwn(configuredOptions, "outdir");
  const outputFormat = format ?? configuredOptions.format ?? "cjs";
  const outfile = path.resolve(
    packageDir,
    hasOutfile
      ? configuredOptions.outfile
      : outputFormat === "esm"
        ? "dist/index.mjs"
        : "dist/index.js",
  );
  const outdir = hasOutdir
    ? path.resolve(packageDir, configuredOptions.outdir)
    : undefined;
  const buildOptions = {
    ...defaultOptions,
    ...configuredOptions,
    format: outputFormat,
    platform:
      configuredOptions.platform ??
      (outputFormat === "esm" ? "browser" : defaultOptions.platform),
    plugins: [...(configuredOptions.plugins ?? [])],
  };

  if (hasOutdir) {
    delete buildOptions.outfile;
    buildOptions.outdir = outdir;
  } else {
    buildOptions.outfile = outfile;
  }

  if (isWatch && outputFormat === "cjs") {
    buildOptions.plugins.push(createWatchSyncPlugin(outdir ?? outfile));
  }

  return buildOptions;
}

/** 清理当前包的 dist 构建目录 */
function cleanDist() {
  const distDir = path.resolve(packageDir, "dist");
  if (path.dirname(distDir) !== packageDir) {
    throw new Error(`[build] 拒绝清理包目录外的路径: ${distDir}`);
  }
  if (!fs.existsSync(distDir)) return;

  for (const entry of fs.readdirSync(distDir)) {
    fs.rmSync(path.resolve(distDir, entry), {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  }
}

/** 调用当前工作区 TypeScript 编译器生成声明文件 */
function emitDeclarations() {
  const result = spawnSync(
    process.execPath,
    [require.resolve("typescript/bin/tsc"), "--emitDeclarationOnly"],
    { cwd: packageDir, stdio: "inherit" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `[build] TypeScript 声明生成失败，退出码: ${result.status}`,
    );
  }
}

/** 使用 terser 对 CommonJS 产物进行二次压缩 */
async function minifyWithTerser(jsPath) {
  if (!controls.terser || !fs.existsSync(jsPath)) return;

  try {
    const mapPath = `${jsPath}.map`;
    const code = fs.readFileSync(jsPath, "utf-8");
    const options = {
      // 允许压缩/混淆模块内的顶级作用域变量（安全混淆非导出变量，保留 module.exports 入口）
      toplevel: true,
      compress: {
        // 保持在 2 轮，不进行过于极端的逻辑重组，在体积与小程序真机运行稳定性之间取得最佳平衡
        passes: 2,
        // 生产环境自动擦除所有的 console.* 打印，优化运行效率
        drop_console: true,
        // 生产环境擦除 debugger 调试器语句，确保安全性
        drop_debugger: true,
      },
      mangle: {
        // 允许混淆工具函数名，因为当前库为纯函数库，无依赖 constructor.name 的动态反射逻辑
        keep_fnames: false,
      },
    };

    if (fs.existsSync(mapPath)) {
      options.sourceMap = {
        content: fs.readFileSync(mapPath, "utf-8"),
        url: path.basename(mapPath),
      };
    }

    const result = await Terser.minify(code, options);
    if (!result.code) return;

    fs.writeFileSync(jsPath, result.code, "utf-8");
    if (result.map && fs.existsSync(mapPath)) {
      fs.writeFileSync(mapPath, result.map, "utf-8");
    }
    console.log(
      `[build] terser 深度混淆完成！体积: ${code.length} B -> ${result.code.length} B`,
    );
  } catch (error) {
    console.warn(
      "[build] terser 二次压缩失败 (将保留 esbuild 默认产物):",
      error.message,
    );
  }
}

/** 递归获取目录下的 JavaScript 构建产物 */
function getJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.resolve(directory, entry.name);
    if (entry.isDirectory()) return getJavaScriptFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [entryPath] : [];
  });
}

/** 执行指定模块格式构建及 CommonJS 后处理 */
async function buildOnce(buildOptions) {
  await esbuild.build(buildOptions);
  if (buildOptions.format !== "cjs") return;

  const outputPath = buildOptions.outdir ?? buildOptions.outfile;
  const javascriptFiles = buildOptions.outdir
    ? getJavaScriptFiles(buildOptions.outdir)
    : [buildOptions.outfile];

  for (const javascriptFile of javascriptFiles) {
    await minifyWithTerser(javascriptFile);
  }
  copyToMiniprogramNpm(outputPath);
}

/** 执行生产构建 */
async function build() {
  console.log(`[build] 开始打包构建 - ${packageName}...`);
  cleanDist();
  emitDeclarations();

  for (const buildOptions of buildPlan) {
    await buildOnce(buildOptions);
  }
  console.log(`[build] 打包构建完成 - ${packageName}。`);
}

/** 启动开发监听构建 */
async function watch() {
  console.log(`[build] 启动监听模式 (Watch Mode) - ${packageName}...`);
  const contexts = await Promise.all(
    buildPlan.map((buildOptions) => esbuild.context(buildOptions)),
  );
  await Promise.all(contexts.map((context) => context.watch()));
}

const formats = controls.formats ?? [configuredOptions.format ?? "cjs"];
const buildPlan = formats.map(createBuildOptions);

console.log(`[build] 开始处理包: ${packageName} (${packageDir})`);
(isWatch ? watch() : build()).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
