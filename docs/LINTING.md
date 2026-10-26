# 代码校验与格式化

[首页](../README.md) · [架构与构建](ARCHITECTURE.md)

| 工具 | 职责 |
| --- | --- |
| Oxlint | JavaScript、TypeScript 校验 |
| Oxfmt | JS、TS、JSON、JSONC、YAML、CSS、SCSS、Less、HTML 格式化 |
| Prettier | WXML、WXS、WXSS 格式化，WXML 使用专用插件 |

同一文件仅由一个格式化器处理。提交前 lint-staged 先格式化，再校验。

## 配置

- `.oxlintrc.jsonc`：规则、忽略目录、公共组件与预览目录的微信全局变量。
- `.oxfmtrc.jsonc`：格式规范和排除范围。
- `prettier.config.mjs`：小程序特殊扩展名配置。
- `.lintstagedrc.cjs`：提交前文件分流。

Oxfmt 不处理微信开发者工具维护的 project.config.json 和
project.private.config.json。Oxlint 对声明文件及测试配置的排除以实际配置为准。
框架不包含 Vue 应用及对应 ESLint 校验链；新增技术栈时再配置所需工具。

## 命令

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
```

## 版本

Oxlint 精确锁定 `1.80.0`。Oxfmt 当前为 Beta，精确锁定 `0.65.0`，
不使用 `^` 或 `~` 自动升级；升级稳定版前需要检查格式差异。
