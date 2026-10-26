# b2bwings-mp

基于 pnpm 与 Turbo 的原生微信小程序公共框架，不包含业务应用。

## 环境

- Node.js 版本以 `.node-version` 为准。
- pnpm `10.27.0`，版本固定在根 `package.json`。
- 微信开发者工具用于查看组件预览。

## 快速开始

```bash
pnpm onboard

# 仅在需要组件预览时执行
pnpm build:ce
```

`onboard` 依次完成四个阶段：安装依赖、初始化环境、准备工具库产物、准备组件产物。
公共产物齐全时跳过对应构建；源码变更后仍需主动构建或开启监听。
仓库不附带业务应用，没有 `apps/` 初始化任务也会成功；接入应用后，
仅为缺少 `config.ts` 的应用按 `defaultEnv` 生成配置，已有文件不覆盖。
失败修复后可重新执行，详见 [初始化说明](packages/scripts/src/onboard/README.md)。

`onboard` 不生成完整预览工程。`pnpm build:ce` 才会生成根目录 `_example/`，
随后在微信开发者工具中导入该目录，选择自己的 AppID 或由工具提供的测试方式。
框架中的 `project.config.json` 不预置真实 AppID；未配置时不保证能直接启动模拟器。
自建应用需独立导入微信开发者工具，并通过“工具 → 构建 npm”完成 npm 构建。

## 文档导航

建议先完成快速开始，再阅读架构构建说明，最后按需要进入模块与专题 API。

| 入口                                                 | 阅读内容                             |
| ---------------------------------------------------- | ------------------------------------ |
| [架构与构建](docs/ARCHITECTURE.md)                   | 包职责、产物流向、构建与监听命令区别 |
| [组件索引](packages/components/README.md)            | 9 个已有组件的用法与 API             |
| [工具索引](packages/utils/README.md)                 | 公开子模块、请求/上传接入与 API      |
| [环境切换](packages/mp-env/README.md)                | 自建应用的环境声明与配置生成         |
| [项目初始化](packages/scripts/src/onboard/README.md) | onboard 阶段、跳过条件与失败重试     |
| [代码校验与格式化](docs/LINTING.md)                  | 检查工具职责与常用命令               |

## 目录

| 目录                                                         | 职责                             |
| ------------------------------------------------------------ | -------------------------------- |
| [packages/components](packages/components/README.md)         | TypeScript 组件源码及组件示例    |
| [packages/miniprogram](docs/ARCHITECTURE.md#组件与预览)      | 组件产物与预览工程模板           |
| [packages/utils](packages/utils/README.md)                   | 请求、导航、金额、上传等公共工具 |
| [packages/scripts](docs/ARCHITECTURE.md#命令如何选择)        | 公共构建脚本                     |
| [packages/testing](docs/ARCHITECTURE.md#测试与共享编译配置)  | 本地测试辅助能力                 |
| [packages/tsconfig](docs/ARCHITECTURE.md#测试与共享编译配置) | 共享 TypeScript 配置             |
| [packages/mp-env](packages/mp-env/README.md)                 | 原生小程序环境切换工具           |

`apps/*` 已注册为工作区，供后续添加独立应用；仓库不附带业务应用。
公共工具优先使用具体子模块入口，例如 `xbd-utils/request`、
`xbd-utils/navigation`、`xbd-utils/price`。

## 常用命令

```bash
pnpm dev:u        # 监听工具库
pnpm dev:c        # 监听组件库
pnpm build:c      # 构建组件产物
pnpm build:ce     # 构建组件预览
pnpm lint
pnpm type-check
pnpm format:check
```

仅开发独立应用时，按实际依赖选择需要构建的公共包，不必无条件构建全部包。
`pnpm env:switch` 发现 `apps/` 下的原生小程序；尚未添加应用时会提示无可选项目。

## 本地测试

测试文件仅用于本地验证，不纳入仓库。各包的测试命令需要先准备本地用例；
没有用例时的退出状态不能作为已有测试覆盖的证明。

代码检查工具职责见 [代码校验与格式化](docs/LINTING.md)。
组件与工具的具体接口见对应公共包文档。

## 发布边界

这是私有基础框架，公共包设置为不可直接发布。仓库未授予开源许可证，
不应仅因能够读取源码就将其公开分发或发布到 npm。
