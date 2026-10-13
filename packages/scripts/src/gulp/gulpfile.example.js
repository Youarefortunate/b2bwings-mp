const path = require("path");
const fs = require("fs");
const gulp = require("gulp");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const gulpSass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const base = require("./gulpfile.base");
const { resolvePath, workspaceRoot } = require("../utils/paths");

const EXAMPLE_TYPE = process.env.TYPE || "all";
const PACKAGE_NAME = "xbd-miniprogram";

/* config */
const src = "packages/miniprogram/example";
const dist = "_example";

/* base tasks */
const {
  clear,
  build: baseBuild,
  watch: baseWatch,
  handleError,
  resetError,
} = base(src, dist, "example");

// src component examples
const exampleRuntimeFiles =
  "{ts,js,json,wxml,wxs,scss,wxss,png,jpg,jpeg,gif,svg}";
const baseExamplePaths = [
  resolvePath(`packages/components/**/_example/**/*.${exampleRuntimeFiles}`),
];
// 示例 watch 只监听会参与小程序示例生成的运行资源，避免 README、测试或临时文件触发重建。
const baseExampleWatchPaths = [
  `packages/components/**/_example/**/*.${exampleRuntimeFiles}`,
];

const srcExampleInput = {
  base: [...baseExamplePaths],
  all: [...baseExamplePaths],
};

const srcExampleWatchInput = {
  base: [...baseExampleWatchPaths],
  all: [...baseExampleWatchPaths],
};

const watchOptions = {
  // 与 base watch 保持一致，统一使用相对 glob + 工作区根目录。
  cwd: workspaceRoot,
  // 只监听新增与变更，删除场景交给重新 build 清理。
  events: ["add", "change"],
  // Windows 与微信开发者工具并行时使用轮询，确保示例与产物同步能触发。
  usePolling: true,
  interval: 300,
};

const srcExampleOutput = resolvePath("packages/miniprogram/example/pages");

const cleanDirectory = (target) =>
  fs.promises.rm(resolvePath(target), {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });

const copySrcExample = (type = "all") => {
  return gulp
    .src(srcExampleInput[type])
    .pipe(changed(srcExampleOutput))
    .pipe(
      rename((path) => {
        const { dirname, extname } = path;
        const [, realDir] = dirname.split("_example");
        const reg = /^([\w-]+)/.exec(dirname);
        const component = reg ? reg[1] : "";

        path.dirname = component + (extname ? realDir : "");
      }),
    )
    .pipe(gulp.dest(srcExampleOutput));
};

const cleanSrcExample = () =>
  Promise.all(
    ["packages/miniprogram/example/pages"].map(async (dir) => {
      const keepDirs = ["home", "gulp-error"];
      const entries = await fs.promises.readdir(resolvePath(dir), {
        withFileTypes: true,
      });
      await Promise.all(
        entries
          .filter((entry) => !keepDirs.includes(entry.name))
          .map((entry) =>
            cleanDirectory(path.join(dir, entry.name)).catch((err) => {
              console.warn(
                `[cleanSrcExample] Warning: Failed to clean '${entry.name}': ${err.message}`,
              );
            }),
          ),
      );
    }),
  );

const watchSrcExample = (type = "all") =>
  gulp.watch(srcExampleWatchInput[type], watchOptions, () =>
    copySrcExample(type),
  );

// 包装 gulp.lastRun, 引入文件 ctime 作为文件变动判断另一标准
// https://github.com/gulpjs/vinyl-fs/issues/226
const since = (task) => (file) =>
  gulp.lastRun(task) > file.stat.ctime ? gulp.lastRun(task) : 0;

/** `gulp syncDist` 将 packages/miniprogram/miniprogram_dist 同步至 _example/miniprogram_npm */
const input = "packages/miniprogram/miniprogram_dist";
const output = `_example/miniprogram_npm/${PACKAGE_NAME}`;
const syncDist = () =>
  gulp
    .src(`${resolvePath(input)}/**`, {
      base: resolvePath(input),
      since: since(syncDist),
    })
    .pipe(changed(resolvePath(output))) // 过滤掉未改变的文件
    .pipe(gulp.dest(resolvePath(output)));

/** `gulp watchDist` 只监听组件构建产物，用于同步至微信开发者工具预览目录 */
const watchDist = () => gulp.watch(`${input}/**`, watchOptions, syncDist);
watchDist.displayName = "syncDist:watch";

/** `gulp build` 构建 */
const build = (type = "all") => {
  return gulp.series(
    cleanSrcExample,
    () => copySrcExample(type),
    baseBuild,
    syncDist,
  );
};

const commonScss = () =>
  gulp
    .src(resolvePath("packages/components/common/styles/index.scss"))
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.error(err);
          handleError(err.message);
        },
      }),
    )
    .pipe(sourcemaps.init())
    .pipe(gulpSass({ outputStyle: "expanded" }).on("error", gulpSass.logError)) // 编译scss
    .pipe(rename({ extname: ".wxss" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(resolvePath(`${output}/common/styles/`)));

// 示例工程只依赖 common/styles 的聚合样式，避免监听 common 下非样式构建资源。
const watchCommonScss = () =>
  gulp.watch(
    "packages/components/common/styles/**/*.scss",
    watchOptions,
    gulp.series(resetError, commonScss),
  );

/** `gulp watch` 监听 */
const watch = (type = "all") => {
  return gulp.parallel(
    baseWatch,
    () => watchSrcExample(type),
    watchCommonScss,
    watchDist,
  );
};

// `gulp --tasks --gulpfile packages/scripts/src/gulp/gulpfile.example.js` list tasks
module.exports = {
  clear,
  build,
  watch,
  default: build(EXAMPLE_TYPE),
};
