const gulp = require("gulp");
const base = require("./gulpfile.base");

/* config */
const componentsPath = "packages/components";
const dist = "packages/miniprogram/miniprogram_dist";

/* base tasks */
const componentsTasks = base(componentsPath, dist, "dist");
const { build: buildAssets } = base(
  componentsPath,
  "packages/miniprogram",
  "assets",
);

/** `gulp clear` 清理文件 */
const clear = gulp.parallel(componentsTasks.clear);

/** `gulp build` 构建 */
const build = gulp.parallel(componentsTasks.build);

/** `gulp watch` 监听 */
const watch = gulp.parallel(componentsTasks.watch);

// `gulp --tasks --gulpfile packages/scripts/src/gulp/gulpfile.dist.js` list tasks
module.exports = {
  clear,
  build,
  buildAssets,
  watch,
  default: build,
};
