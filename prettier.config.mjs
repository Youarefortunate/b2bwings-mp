// Oxfmt 暂不支持 WXML 及微信小程序特殊扩展名因此 Prettier 仅负责这些文件
export default {
  printWidth: 80, // 单行代码字符数限制，超出将尝试换行
  tabWidth: 2, // 每一个缩进级别的空格数
  useTabs: false, // 不使用 tab 缩进，而使用空格
  semi: true, // 在语句末尾添加分号
  singleQuote: false, // 使用双引号而非单引号（与微信小程序规范契合）
  trailingComma: "all", // 在多行元素、数组或对象末尾添加尾随逗号
  bracketSpacing: true, // 在对象字面量（大括号）内侧添加空格，例如 { foo: bar }
  bracketSameLine: false, // HTML/WXML 标签的多行关闭符号不单起一行，而紧跟在属性末尾
  arrowParens: "always", // 箭头函数仅有一个参数时，也强制包裹圆括号
  endOfLine: "lf", // 行尾换行符统一使用 LF
  overrides: [
    {
      files: "*.wxml", // 微信小程序 WXML 模板文件
      options: {
        parser: "wxml",
        plugins: ["@tofrankie/prettier-plugin-wxml"],
        trailingComma: "none", // WXML 表达式不支持尾随逗号
        htmlWhitespaceSensitivity: "ignore", // 忽略内联元素空格敏感度
      },
    },
    {
      files: ["*.wxss", "*.scss"], // 微信小程序样式文件 WXSS 和标准 SCSS 文件
      options: {
        parser: "scss", // 使用 SCSS 解析器格式化
      },
    },
    {
      files: "*.wxs", // 微信小程序逻辑脚本 WXS 文件
      options: {
        parser: "babel", // 使用 Babel 解析器格式化
      },
    },
    {
      files: ["*.json", ".prettierrc"], // JSON 数据及相关配置文件
      options: {
        parser: "json", // 使用 JSON 解析器格式化
      },
    },
  ],
};
