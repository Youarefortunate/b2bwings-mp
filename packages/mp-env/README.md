# xbd-mp-env 多小程序环境切换

原生微信小程序的多环境切换工具。每个小程序在 `apps/<name>/` 下声明一份环境配置，通过 CLI 把目标环境的配置生成为该应用根目录的 `config.ts`，业务代码统一从 `@/config` 读取，无需改动业务逻辑即可切换环境。

## 治理模型

```text
apps/<name>/env.config.ts   ① 声明 common 与各环境配置（唯一需要手写的文件）
        │
        │  pnpm env:switch <app> <env>
        ▼
apps/<name>/config.ts       ② 按当前环境生成的配置（自动生成，勿手改）
        │
        │  import config from "@/config"
        ▼
业务代码                     ③ 读取 baseUrl 等配置，不感知环境
```

多小程序共用一套机制：每个应用各自维护 `env.config.ts`，环境名在各应用间对齐，即可用一条命令批量切换所有应用。

## 声明环境：env.config.ts

在应用根目录创建 `env.config.ts`，默认导出 `{ envs }`。除 `common` 外的键都会被视为环境名。

```ts
// apps/<name>/env.config.ts
import { defineMpEnvConfig } from "xbd-mp-env";

interface AppEnvs {
  common: { publicKey: string };
  test: { baseUrl: string; APPID: string };
  uat: { baseUrl: string; APPID: string };
  prod: { baseUrl: string; APPID: string };
  gray: { baseUrl: string; APPID: string };
}

export default defineMpEnvConfig<AppEnvs>({
  envs: {
    common: { publicKey: "public-key" },
    test: { baseUrl: "https://test.example.com", APPID: "wx-test" },
    uat: { baseUrl: "https://uat.example.com", APPID: "wx-uat" },
    prod: { baseUrl: "https://example.com", APPID: "wx-prod" },
    gray: { baseUrl: "https://gray.example.com", APPID: "wx-gray" },
  },
});
```

`defineMpEnvConfig` 只提供类型约束（返回原对象），不产生运行时副作用。

### 规则

- `common` 为共享配置保留字，会与目标环境浅合并，同名键由目标环境覆盖。
- `all` 为 CLI 批量切换保留字，不能用作环境名。
- 至少定义一个 `common` 之外的环境，否则工具报错。
- 同一配置的扩展名优先级为 `.ts` > `.js`（兼容 `env.config.js`）。

## 命令

在仓库根目录执行，`env:switch` 对应 `packages/mp-env/src/cli.ts`：

```bash
# 总览：列出所有已接入的小程序及其当前环境与可用环境
pnpm env:switch

# 查看单个小程序的状态
pnpm env:switch <app>

# 切换单个小程序到指定环境
pnpm env:switch <app> <env>

# 批量切换所有定义了该环境的小程序
pnpm env:switch all <env>
```

`<app>` 为 `apps/` 下的目录名。名称写错时会提示已接入的应用与相近名称。

## 切换时发生什么

一次切换会依次完成三件事：

1. **生成 `apps/<name>/config.ts`**：写入 `common` 与目标环境合并后的配置，文件头标注生成工具与当前环境（`当前环境: <env>`），内容用 `Object.freeze` 冻结。该文件为自动生成产物，请勿手动修改。
2. **清理旧产物**：若存在历史 `apps/<name>/config.js`，会被删除，避免与新生成的 `config.ts` 冲突。
3. **同步 `APPID`**：合并配置中的 `APPID`（字符串）会写入 `apps/<name>/project.config.json` 的 `appid` 字段。`project.config.json` 不存在时跳过；解析失败时跳过并给出警告。

批量切换 `all` 时，未定义该环境的小程序会被跳过并警告；若没有任何小程序被切换，命令以非零码退出。

## 业务代码消费配置

应用需在自身 `tsconfig.json` 中把 `@/*` 映射到应用根目录（`"paths": { "@/*": ["./*"] }`），此时 `@/config` 即当前环境生成的配置：

```ts
// lib/request/shared.ts
import config from "@/config";

export const baseTransportOptions = {
  baseUrl: config.baseUrl,
  timeout: 15000,
};
```

请求与上传实例的 `baseUrl` 取自这里，完整接入示例见 [utils 请求、上传与 Hook 使用](../utils/REQUEST-UPLOAD-HOOKS.md)。

## 多小程序治理约定

- **环境名保持统一**。各应用使用同一组环境名（如 `test` / `uat` / `prod` / `gray`），`pnpm env:switch all <env>` 才能一次性切换全部应用。
- **`common` 只放跨环境不变的配置**。与环境相关的值（域名、APPID）写在各自环境里。
- **`config.ts` 是生成产物**。切换环境会覆盖它；是否纳入版本提交需团队统一约定——当前仓库 `.gitignore` 未排除该文件，默认会被提交，切换环境后会产生待提交变更。
- **`env.config.ts` 手写，`config.ts` 自动生成**。不要手改生成文件，也不要提交临时的环境改动。
- **应用隔离**。每个应用的 `env.config.ts` 只描述自己的环境，不跨应用引用配置。

## 前置条件

- 仓库根目录存在 `pnpm-workspace.yaml`，CLI 据此定位根目录。
- 应用位于 `apps/<name>/`，且该目录下存在 `env.config.ts`（或 `env.config.js`）。
- 仓库当前未接入任何应用时，`pnpm env:switch` 会提示：`未发现已接入的小程序。接入方式：在 apps/<name>/ 下创建 env.config.ts`。