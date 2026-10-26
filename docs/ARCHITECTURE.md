# 架构与构建

[首页](../README.md) · [组件索引](../packages/components/README.md) · [工具索引](../packages/utils/README.md)

本仓库是 pnpm + Turbo 管理的公共框架，不附带业务应用。
`apps/*` 已注册为工作区，可按需接入独立原生微信小程序；组件预览与应用工程是两个入口。

## 包职责

| 目录 / 包名                                | 职责                                      | 继续阅读                                     |
| ------------------------------------------ | ----------------------------------------- | -------------------------------------------- |
| `packages/components` / `xbd-components`   | 组件 TypeScript、模板、样式与组件示例源码 | [组件索引](../packages/components/README.md) |
| `packages/miniprogram` / `xbd-miniprogram` | 承接组件分发产物，保存预览工程模板        | [组件与预览](#组件与预览)                    |
| `packages/utils` / `xbd-utils`             | 请求、上传、导航、金额等工具及类型声明    | [工具索引](../packages/utils/README.md)      |
| `packages/scripts` / `xbd-scripts`         | 工具打包、Gulp 组件流水线与初始化脚本     | [命令如何选择](#命令如何选择)                |
| `packages/mp-env` / `xbd-mp-env`           | 发现应用、环境切换与配置生成              | [环境切换](../packages/mp-env/README.md)     |
| `packages/testing` / `xbd-testing`         | 本地 Vitest 配置工厂与基础小程序 mock     | [测试与共享编译配置](#测试与共享编译配置)    |
| `packages/tsconfig` / `tsconfig`           | 共享 TypeScript 编译选项                  | [测试与共享编译配置](#测试与共享编译配置)    |

## 工具库产物

```text
packages/utils/src/
  → build-pkg.js（生产构建：声明生成、esbuild、CommonJS 后处理）
  → packages/utils/dist/（JavaScript、声明文件与 sourcemap）
  → 应用按 xbd-utils/<module> 导入
```

入口与输出目录由 [utils/package.json](../packages/utils/package.json) 的 `xbdBuild` 定义；
`exports`、`main`、`types` 均指向 `dist`。
[build-pkg.js](../packages/scripts/src/tasks/build-pkg.js) 默认输出 CommonJS；
生产构建清理 `dist` 并调用 TypeScript 生成声明，随后运行 esbuild 和 Terser 后处理。
开发监听使用 esbuild watch，不运行生产构建中的清理与声明生成步骤，不能替代生产构建验证。

该脚本在生产构建完成或 CommonJS 监听构建成功后，会将产物同步到
`apps/<name>/miniprogram_npm/<包名>/`，但只处理在 `dependencies` 中声明该包的直接应用目录。
这是工具打包脚本的同步行为，不是组件分发包的通用应用同步机制，也不替代应用自身的 npm 构建。

## 组件与预览

```text
packages/components/（排除组件 _example/）
  → Gulp：TS → JS/声明，SCSS → WXSS，处理模板与资源
  → packages/miniprogram/miniprogram_dist/
      ├─ 应用通过 xbd-miniprogram 消费
      └─ 同步到 _example/miniprogram_npm/xbd-miniprogram/

packages/components/**/_example/
  → packages/miniprogram/example/pages/（保留 home、gulp-error）
  + packages/miniprogram/example/ 预览模板
  → 根目录 _example/ 预览工程
```

组件输出目录由 [gulpfile.dist.js](../packages/scripts/src/gulp/gulpfile.dist.js) 定义；
编译、资源处理与排除规则见 [gulpfile.base.js](../packages/scripts/src/gulp/gulpfile.base.js)。
示例汇集、模板编译和已有产物同步见 [gulpfile.example.js](../packages/scripts/src/gulp/gulpfile.example.js)。
`_example/` 是生成物，不是组件源码目录，也不是自建应用。

应用应声明 `xbd-miniprogram` 依赖，再按组件文档在 `usingComponents` 中使用
`xbd-miniprogram/<组件>/<组件>`，不能直接引用源码物理路径。
分发入口见 [miniprogram/package.json](../packages/miniprogram/package.json)；其中 `miniprogram` 字段指向 `miniprogram_dist`，并声明 `xbd-utils` 为 peer dependency。
自建应用需独立导入微信开发者工具，并通过“工具 → 构建 npm”准备应用的 npm 依赖。

## 命令如何选择

以下命令均在仓库根目录执行，入口见[根 package.json](../package.json)、
[组件包脚本](../packages/components/package.json)和 [Turbo 任务配置](../turbo.json)。

| 命令            | 实际范围                                                                                      | 适用场景               |
| --------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| `pnpm onboard`  | 安装依赖 → 初始化应用环境 → 按缺失情况准备工具与组件产物；不生成完整预览                      | 首次准备、失败后重试   |
| `pnpm build`    | `turbo run build`，调度具有 build 脚本的工作区；组件的 build 会先构建分发产物，再构建完整预览 | 需要各包完整构建时     |
| `pnpm build:c`  | 仅运行组件 `build:dist`，输出 `miniprogram_dist`，不执行完整示例流水线                        | 只更新组件分发产物     |
| `pnpm build:ce` | 运行组件 `build:example`，汇集示例、编译预览模板并同步已有组件产物，不重新编译组件            | 已有组件产物后准备预览 |
| `pnpm dev:u`    | 工具库 esbuild 监听，构建成功后按依赖同步到应用                                               | 修改工具库             |
| `pnpm dev:c`    | 开发模式先构建组件与完整预览，再监听组件、示例与预览产物同步                                  | 修改组件并预览         |

`onboard` 的阶段定义见 [stages.mjs](../packages/scripts/src/onboard/stages.mjs)，
缺失产物检查不比较源码时间戳：产物齐全只表示无需补建，不表示与最新源码一致。
修改源码后主动构建或监听；失败重试、配置保留与中断规则见[项目初始化](../packages/scripts/src/onboard/README.md)。

组件整体 build/dev 的串联关系见 [gulpfile.js](../packages/scripts/src/gulp/gulpfile.js)。
Gulp 监听只处理新增与变更，删除文件后应重新完整构建以清理旧产物。
初次预览可用 `pnpm onboard` 后接 `pnpm build:ce`；修改组件源码后可用 `pnpm dev:c` 同步开发。
微信开发者工具中的 AppID 或测试方式仍需自行选择，仓库不预置真实 AppID。

## 测试与共享编译配置

[xbd-testing 配置工厂](../packages/testing/src/vitest/index.ts)提供
`createVitestConfig` 与 `createMiniprogramVitestConfig`，统一 Node 测试环境、测试匹配、覆盖率选项与别名。
[小程序 setup](../packages/testing/src/vitest/setup/miniprogram.ts)注册基础 `App`、`Page`、`Component`、`Behavior` mock，
并为 `wx` 方法提供可配置的 `vi.fn`；这些桩函数不模拟完整微信运行时、生命周期或真实网络行为。

配置中的覆盖率阈值不是实测结果。仓库不提交本地测试用例，不能据此声称已有测试覆盖、端到端验证或达到某一覆盖率。
本地用例组织与命令见[首页](../README.md#本地测试)。

[tsconfig/base.json](../packages/tsconfig/base.json)共享严格检查、ESNext 模块、bundler 模块解析等基础选项；
各工作区再通过自己的 tsconfig 配置环境与输出。它不负责执行打包，构建入口仍由上述脚本决定。
代码校验与格式化职责见[对应专题](LINTING.md)。
