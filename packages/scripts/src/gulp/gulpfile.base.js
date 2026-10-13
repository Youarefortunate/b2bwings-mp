const path = require("path");
const fs = require("fs");
const gulp = require("gulp");
const replace = require("gulp-replace");
const plumber = require("gulp-plumber");
const changed = require("gulp-changed");
const gulpTs = require("gulp-typescript");
const merge2 = require("merge2");
const sourcemaps = require("gulp-sourcemaps");
const gulpSass = require("gulp-sass")(require("sass"));
const cssmin = require("gulp-clean-css");
const gulpInsert = require("gulp-insert");
const jsmin = require("gulp-terser");
const jsonmin = require("gulp-jsonminify");
const wxmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const replaceTask = require("gulp-replace-task");
const mpNpm = require("gulp-mp-npm");
const gulpIf = require("gulp-if");

const config = require("./config");
const { resolvePath, workspaceRoot } = require("../utils/paths");

// 通过路径辅助函数动态计算基础样式文件路径，摆脱对 __dirname 层级的硬编码依赖
const baseCssPath = resolvePath("packages/components/common/styles/index.wxss");

const isProduction = process.env.NODE_ENV === "production";
const ignoreTerser = process.argv.includes("--ignore-terser");

const mpNpmOptions = { fullExtract: ["miniprogram/common"] };

const cleanDirectory = (target) =>
  fs.promises.rm(resolvePath(target), {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });

// set displayName
const setDisplayName = (tasks, moduleName) => {
  Object.keys(tasks).forEach((key) => {
    if (!tasks[key].displayName) {
      tasks[key].displayName = moduleName ? `${moduleName}:${key}` : key;
    }
  });
};

const isJsonFile = (file) => {
  return file.path.endsWith(".json");
};

// generate config replace task
const generateConfigReplaceTask = (replaceConfig, options = {}) => {
  return replaceTask({
    patterns: Object.entries(replaceConfig).map(([key, value]) => ({
      match: key,
      replacement: options.stringify ? JSON.stringify(value) : value,
    })),
    usePrefix: false,
  });
};

const isComponent = (dir) => {
  return dir === "packages/components";
};

/* return gulpfile base tasks */
module.exports = (srcPath, distPath, moduleName) => {
  const src = resolvePath(srcPath);
  const dist = resolvePath(distPath);
  const watchSrc = srcPath.replace(/\\/g, "/");
  const watchIgnore = [
    `!${watchSrc}/**/__test__/**`,
    `!${watchSrc}/**/__tests__/**`,
    `!${watchSrc}/**/tests/**`,
    `!${watchSrc}/**/_example/**`,
    `!${watchSrc}/**/node_modules/**`,
    `!${watchSrc}/**/package.json`,
    `!${watchSrc}/**/*.md`,
    `!${watchSrc}/common/assets/icons/**`, // common目录下assets/icons自动同步iconfont里面的所有图标目录不监听变化
  ];

  let tsconfigPath = resolvePath("tsconfig.json");
  const parts = srcPath.split("/");
  if (parts.length >= 2) {
    const pkgDir = parts.slice(0, 2).join("/");
    const pkgTsconfig = resolvePath(path.join(pkgDir, "tsconfig.json"));
    if (fs.existsSync(pkgTsconfig)) {
      tsconfigPath = pkgTsconfig;
    }
  }

  const tsProject = gulpTs.createProject(tsconfigPath, {
    declaration: isComponent(srcPath),
    removeComments: isProduction,
    importHelpers: true,
    noEmitHelpers: true,
    noEmit: false,
  });

  // options
  const ignore = [
    "**/__test__/**",
    "**/__tests__/**",
    "**/tests/**",
    "**/_example/**",
    "**/node_modules/**",
    "**/package.json",
    "common/assets/icons/**", // common目录下assets/icons自动同步iconfont里面的所有图标目录不参与打包
  ];
  const srcOptions = { base: src, ignore };
  const watchOptions = {
    // 使用相对 glob + 工作区根目录，避免 Windows 绝对路径导致 chokidar 匹配不稳定。
    cwd: workspaceRoot,
    // 只监听新增与内容变更；删除由下一次完整构建处理，避免开发态误删输出。
    events: ["add", "change"],
    // 微信开发者工具与 Windows 文件系统组合下原生事件不稳定，轮询可保证热更新触发。
    usePolling: true,
    interval: 300,
  };
  const gulpErrorPath = resolvePath(
    "packages/miniprogram/example/utils/gulpError.js",
  );

  // 文件匹配路径
  const globs = {
    wxml: `${src}/**/*.wxml`, // 匹配 wxml 文件
    ts: `${src}/**/*.ts`, // 匹配 ts 文件
    js: `${src}/**/*.js`, // 匹配 js 文件
    wxs: `${src}/**/*.wxs`, // 匹配 wxs 文件
    json: [`${src}/**/*.json`], // 匹配 json 文件
    scss: `${src}/**/*.scss`, // 匹配 scss 文件
    wxss: `${src}/**/*.wxss`, // 匹配 wxss 文件
    md: `${src}/**/*.md`, // 匹配 md 文件
  };

  // 匹配需要拷贝的文件
  globs.copy = [
    `${src}/**`,
    `!${globs.wxml}`,
    `!${globs.ts}`,
    `!${globs.js}`,
    `!${globs.wxs}`,
    `!${globs.json}`,
    `!${globs.scss}`,
    `!${globs.wxss}`,
    `!${globs.md}`,
    "!**/_example/**",
    `!${src}/common/assets/icons/**`, // common目录下assets/icons自动同步iconfont里面的所有图标目录不参与打包
  ];

  // watch 只覆盖 dist 构建会消费的原生小程序运行资源，排除示例、测试、文档和包配置。
  const watchGlobs = {
    copy: [
      `${watchSrc}/**`,
      `!${watchSrc}/**/*.wxml`,
      `!${watchSrc}/**/*.ts`,
      `!${watchSrc}/**/*.js`,
      `!${watchSrc}/**/*.wxs`,
      `!${watchSrc}/**/*.json`,
      `!${watchSrc}/**/*.scss`,
      `!${watchSrc}/**/*.wxss`,
      ...watchIgnore,
    ],
    wxml: [`${watchSrc}/**/*.wxml`, ...watchIgnore],
    ts: [`${watchSrc}/**/*.ts`, ...watchIgnore],
    js: [`${watchSrc}/**/*.js`, ...watchIgnore],
    wxs: [`${watchSrc}/**/*.wxs`, ...watchIgnore],
    json: [`${watchSrc}/**/*.json`, ...watchIgnore],
    scss: [`${watchSrc}/**/*.scss`, ...watchIgnore],
    wxss: [`${watchSrc}/**/*.wxss`, ...watchIgnore],
  };

  // 包装 gulp.lastRun, 引入文件 ctime 作为文件变动判断另一标准
  // https://github.com/gulpjs/vinyl-fs/issues/226
  const since = (task) => (file) =>
    gulp.lastRun(task) > file.stat.ctime ? gulp.lastRun(task) : 0;

  /* tasks */
  const tasks = {};

  /** `gulp clear` 清理文件 */
  tasks.clear = () =>
    cleanDirectory(distPath).catch((err) => {
      console.warn(
        `[gulp clear] Warning: clean directory '${distPath}' failed: ${err.message}`,
      );
      if (isProduction && distPath !== "_example") {
        throw err;
      }
    });

  /** `gulp handleError` 输出错误到小程序 */
  tasks.handleError = (err) =>
    gulp
      .src(gulpErrorPath, {
        base: resolvePath("packages/miniprogram/example"),
      })
      .pipe(replace("gulpErrorPlaceHolder", err))
      .pipe(gulp.dest(resolvePath("_example/")));

  /** `gulp resetError` 重置gulpError */
  tasks.resetError = () =>
    gulp
      .src(gulpErrorPath, {
        base: resolvePath("packages/miniprogram/example"),
        allowEmpty: true,
      })
      .pipe(gulp.dest(resolvePath("_example/")));

  /** `gulp copy` 清理 */
  tasks.copy = () =>
    gulp
      .src(globs.copy, { ...srcOptions, since: since(tasks.copy) })
      .pipe(changed(dist)) // 过滤掉未改变的文件
      .pipe(gulp.dest(dist));

  /** `gulp wxml` 处理 wxml */
  tasks.wxml = () =>
    gulp
      .src(globs.wxml, { ...srcOptions, since: since(tasks.wxml) })
      .pipe(
        gulpIf(
          isComponent(srcPath) && isProduction && !ignoreTerser,
          wxmlmin({
            removeComments: true,
            collapseWhitespace: true,
            keepClosingSlash: true,
            caseSensitive: true,
          }),
        ),
      )
      .pipe(gulp.dest(dist));

  /** `gulp ts` 处理ts */
  tasks.ts = () => {
    const tsResult = gulp
      .src(globs.ts, srcOptions)
      .pipe(
        plumber({
          errorHandler: (err) => {
            tasks.handleError(err.message);
          },
        }),
      )
      .pipe(generateConfigReplaceTask(config, { stringify: true }))
      .pipe(gulpIf(!isProduction, sourcemaps.init()))
      .pipe(tsProject()); // 编译ts

    return merge2(
      tsResult.js
        .pipe(mpNpm())
        .pipe(
          gulpIf(
            isComponent(srcPath) && isProduction && !ignoreTerser,
            jsmin(),
          ),
        )
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dist)),
      tsResult.dts.pipe(gulp.dest(dist)), // 直接输出.d.ts文件
    );
  };

  /** `gulp js` 处理js */
  tasks.js = () =>
    gulp
      .src(globs.js, { ...srcOptions, since: since(tasks.js) })
      .pipe(generateConfigReplaceTask(config, { stringify: true }))
      .pipe(mpNpm())
      .pipe(
        gulpIf(isComponent(srcPath) && isProduction && !ignoreTerser, jsmin()),
      )
      .pipe(gulp.dest(dist));

  /** `gulp wxs` 处理wxs */
  tasks.wxs = () =>
    gulp
      .src(globs.wxs, { ...srcOptions, since: since(tasks.wxs) })
      .pipe(generateConfigReplaceTask(config, { stringify: true }))
      .pipe(gulp.dest(dist));

  /** `gulp json` 处理json */
  tasks.json = () =>
    gulp
      .src(globs.json, { ...srcOptions, dot: true, since: since(tasks.json) })
      .pipe(mpNpm(mpNpmOptions))
      .pipe(
        gulpIf(
          isComponent(srcPath) && isProduction && isJsonFile && !ignoreTerser,
          jsonmin(),
        ),
      )
      .pipe(gulp.dest(dist));

  /** `gulp wxss` 处理wxss */
  tasks.wxss = () =>
    gulp
      .src(globs.wxss, { ...srcOptions, since: since(tasks.wxss) })
      .pipe(gulp.dest(dist));

  /** `gulp scss` 处理scss */
  tasks.scss = () =>
    gulp
      .src(globs.scss, { ...srcOptions, since: since(tasks.scss) })
      .pipe(
        plumber({
          errorHandler: (err) => {
            console.log(err);
            tasks.handleError(err.message);
          },
        }),
      )
      .pipe(generateConfigReplaceTask(config, { stringify: false }))
      .pipe(gulpIf(!isProduction, sourcemaps.init()))
      .pipe(
        gulpSass({ outputStyle: "expanded" }).on("error", gulpSass.logError),
      ) // 编译scss
      .pipe(replace(/@import\s+url\((['"])([^'"]+)\1\);/g, "@import $1$2$1;")) // 将 @import url("...") 还原为 @import "..."（微信小程序仅支持非 url 形式的导入）
      .pipe(
        gulpIf(
          isComponent(srcPath) && isProduction,
          cssmin({
            compatibility: "ie9",
            level: {
              1: {
                specialComments: false,
              },
              2: {
                restructureRules: false,
                mergeAdjacent: false,
                mergeIntoShorthands: false,
                mergeMedia: false,
                mergeNonAdjacentByBody: false,
                mergeNonAdjacentBySelector: false,
              },
            },
            format: {
              semicolonAfterLastProperty: true,
              breaks: {
                afterAtRule: true,
                afterRuleEnds: true,
                afterBlockBegins: true,
                afterBlockEnds: true,
              },
            },
          }),
        ),
      )
      .pipe(
        gulpIf(
          isComponent(srcPath),
          gulpInsert.transform((contents, file) => {
            if (!file.path.includes(`components${path.sep}common`)) {
              const relativePath = path
                .relative(
                  path.normalize(`${file.path}${path.sep}..`),
                  baseCssPath,
                )
                .replace(/\\/g, "/")
                .replace(/(?:\.\.\/){2}components\//g, "");

              // 检查 contents 中是否包含 @charset，如果包含，则把 @import 插在 @charset 之后
              const charsetRegex = /^@charset\s+(['"])[^'"]+\1;\s*/i;
              const match = contents.match(charsetRegex);
              if (match) {
                const charsetString = match[0];
                contents = `${charsetString}@import '${relativePath}';\n${contents.substring(charsetString.length)}`;
              } else {
                contents = `@import '${relativePath}';${contents}`;
              }
            }
            return contents;
          }),
        ),
      )
      .pipe(rename({ extname: ".wxss" }))
      .pipe(gulpIf(!isProduction, sourcemaps.write(".")))
      .pipe(gulp.dest(dist));

  /** `gulp common` 拷贝common中样式 */
  tasks.common = () =>
    gulp
      .src(globs.wxss, { ...srcOptions, since: since(tasks.wxss) })
      .pipe(gulp.dest(dist));

  // set displayName
  setDisplayName(tasks, moduleName);

  /** `gulp build` 构建 */
  tasks.build = gulp.series(
    tasks.clear,
    tasks.resetError,
    gulp.parallel(
      tasks.copy,
      tasks.wxml,
      tasks.ts,
      tasks.js,
      tasks.wxs,
      tasks.json,
      tasks.scss,
      tasks.wxss,
    ),
  );

  /** `gulp watch` 监听 */
  tasks.watch = () => {
    const watcher = gulp.watch(watchGlobs.copy, watchOptions, tasks.copy);
    gulp.watch(watchGlobs.wxml, watchOptions, tasks.wxml);
    gulp.watch(
      watchGlobs.ts,
      watchOptions,
      gulp.series(tasks.resetError, tasks.ts),
    );
    gulp.watch(watchGlobs.js, watchOptions, tasks.js);
    gulp.watch(watchGlobs.wxs, watchOptions, tasks.wxs);
    gulp.watch(watchGlobs.json, watchOptions, tasks.json);
    gulp.watch(
      watchGlobs.scss,
      watchOptions,
      gulp.series(tasks.resetError, tasks.scss),
    );
    gulp.watch(watchGlobs.wxss, watchOptions, tasks.wxss);

    return watcher;
  };

  // set displayName again
  setDisplayName(tasks, moduleName);

  return tasks;
};
