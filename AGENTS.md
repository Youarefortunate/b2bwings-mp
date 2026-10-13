# b2bwings-mp 框架规范

## 结构与边界

- pnpm + Turbo Monorepo；`packages/` 为公共能力，`apps/*` 为未来应用工作区。
- 各应用改动限制在目标应用内，不跨项目混淆业务。
- 优先复用公共组件和工具，禁止直接引用公共包物理源码路径。
- 小程序工具从具体子模块导入，避免从 `xbd-utils` 根入口引入无关依赖。

## 代码规范

- Oxfmt：两空格、双引号、分号、尾随逗号、80 字符、LF。
- WXML/WXS/WXSS 使用 Prettier；JS/TS 使用 Oxlint。
- Oxfmt 当前为 Beta，精确锁定版本；稳定版发布后评估格式差异再升级。
- 页面目录和 JS/JSON/WXML/SCSS 文件使用相同 kebab-case 名称，页面逻辑使用 JavaScript。
- 可复用组件使用 TypeScript、kebab-case 文件名、props.ts、BEM 类名。
- 尺寸使用 rpx，SCSS 嵌套不超过三层，导入使用 @use。
- 不手动修改生成的 styles/unocss.wxss。
- 微信全局变量仅注入明确的小程序应用或公共组件预览目录，不注入通用 Node 工具。

## 本地测试

- 各工作区独立配置 Vitest。
- 用例放在 tests/ 中，目录镜像源码，命名为 `<源文件名>.test.ts`。
- 覆盖正常、边界、异常、分支和副作用场景。
- 使用 `pnpm --filter <包名> test` 运行本地用例。
- 测试文件仅用于本地验证，不得提交、推送或上传。
