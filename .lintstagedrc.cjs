// 忽略校验与格式化的文件模式
const ignorePatterns = [
  /unocss\.wxss$/,
  /echarts\.js$/,
  /echarts\.d\.ts$/,
  /packages[\\/]utils[\\/]src[\\/]lodash[\\/]/,
];

const filterFiles = (files) =>
  files.filter((file) => !ignorePatterns.some((pattern) => pattern.test(file)));

module.exports = {
  "**/*.{js,jsx,ts,tsx,scss,less,css,html,json,jsonc,yaml,yml,mjs,cjs}": (
    files,
  ) => {
    const filteredFiles = filterFiles(files);
    if (!filteredFiles.length) return [];

    const commands = [`oxfmt --write ${filteredFiles.join(" ")}`];
    const lintFiles = filteredFiles.filter((file) =>
      /\.(cjs|js|jsx|mjs|ts|tsx)$/.test(file),
    );
    if (lintFiles.length) {
      commands.push(
        `oxlint --fix --no-error-on-unmatched-pattern ${lintFiles.join(" ")}`,
      );
    }
    return commands;
  },
  "**/*.{wxml,wxs,wxss}": (files) => {
    const filteredFiles = filterFiles(files);
    return filteredFiles.length
      ? `prettier --write ${filteredFiles.join(" ")}`
      : [];
  },
};
