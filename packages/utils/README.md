# xbd-utils

通用微信小程序工具库，提供请求、上传、分页、导航、金额格式化和轻量通用工具。

业务项目应优先从 `xbd-utils/<module>` 具体子模块导入，避免扩大依赖链和小程序包体。

## 公开入口

| 导入路径                | 主要能力                                                      | 详细文档                                          |
| :---------------------- | :------------------------------------------------------------ | :------------------------------------------------ |
| `xbd-utils/request`     | `Request` 请求实例、请求配置及相关类型                        | [request 请求工具](./src/request/README.md)       |
| `xbd-utils/upload`      | `Upload`、`UploadMode`、`UploadAggregateError`                | [upload 上传工具](./src/upload/README.md)         |
| `xbd-utils/transport`   | `BaseTransport` 传输基类及相关类型                            | -                                                 |
| `xbd-utils/hooks`       | `createUseRequest`、`createUsePageRequest`、`createUseUpload` | [hooks](./src/hooks/README.md)                    |
| `xbd-utils/pageRequest` | `PageRequest` 分页请求类及相关类型                            | [hooks](./src/hooks/README.md)                    |
| `xbd-utils/navigation`  | `navigator`、`Navigator` 及导航类型                           | [navigation 路由跳转](./src/navigation/README.md) |
| `xbd-utils/price`       | `formatPriceToFixed` 金额格式化                               | 本文档                                            |
| `xbd-utils/utils`       | 轻量判断、页面栈与样式工具                                    | 本文档                                            |
| `xbd-utils/verify`      | `isHyperLink` 链接校验                                        | 本文档                                            |

根入口 `xbd-utils` 也会导出上述能力，但业务代码应尽量使用具体子模块。

请求、上传与其 Hook 在小程序中的完整配置与使用示例见 [请求、上传与 Hook 使用](./REQUEST-UPLOAD-HOOKS.md)。

## 快速开始

创建请求实例后，可以直接发起请求，也可以将实例绑定为业务侧 Hook。

```ts
import { createUseRequest } from "xbd-utils/hooks";
import { Request } from "xbd-utils/request";

const request = Request.create({
  baseUrl: "https://api.example.com",
});

const useRequest = createUseRequest(request);
const { state, fetch } = useRequest("GET /user/detail", {
  id: "10001",
});

await fetch();
console.log(state.data);
```

## 请求与传输

| 工具                              | 作用描述                                     | 文档                                        |
| :-------------------------------- | :------------------------------------------- | :------------------------------------------ |
| `Request`                         | 请求实例，提供默认配置、拦截器及请求方法。   | [request 请求工具](./src/request/README.md) |
| `request`                         | `Request` 实例方法，按完整请求配置发起请求。 | [request 请求工具](./src/request/README.md) |
| `get` / `post` / `put` / `delete` | `Request` 实例的快捷请求方法。               | [request 请求工具](./src/request/README.md) |
| `BaseTransport`                   | 提供配置合并和拦截器生命周期的传输基类。     | -                                           |

## 分页与 Hooks

| 工具                   | 作用描述                                 | 文档                                                   |
| :--------------------- | :--------------------------------------- | :----------------------------------------------------- |
| `createUseRequest`     | 绑定 `Request` 实例并创建普通请求 Hook。 | [hooks](./src/hooks/README.md)                         |
| `createUsePageRequest` | 绑定 `Request` 实例并创建分页请求 Hook。 | [hooks](./src/hooks/README.md)                         |
| `createUseUpload`      | 绑定 `Upload` 实例并创建上传 Hook。      | [useUpload 上传 Hook](./src/hooks/useUpload/README.md) |
| `PageRequest`          | 封装分页参数、分页状态及请求前后回调。   | [hooks](./src/hooks/README.md)                         |

## 上传

| 工具                   | 作用描述                                                     | 文档                                      |
| :--------------------- | :----------------------------------------------------------- | :---------------------------------------- |
| `Upload`               | 文件上传管理器，支持多文件调度、校验、进度、取消与聚合错误。 | [upload 上传工具](./src/upload/README.md) |
| `UploadMode`           | 上传调度模式，提供 Queue 串行和 Pool 并发两种模式。          | [upload 上传工具](./src/upload/README.md) |
| `UploadAggregateError` | 汇总多文件上传失败结果。                                     | [upload 上传工具](./src/upload/README.md) |

## 导航

| 工具                       | 作用描述                                            | 文档                                              |
| :------------------------- | :-------------------------------------------------- | :------------------------------------------------ |
| `navigator.navTo`          | 统一处理页面跳转、返回、tabBar 识别和复杂参数传递。 | [navigation 路由跳转](./src/navigation/README.md) |
| `navigator.setTabBarLinks` | 设置供 `navTo` 自动识别的 tabBar 页面列表。         | [navigation 路由跳转](./src/navigation/README.md) |
| `navigator.getTabBarLinks` | 获取已注册的 tabBar 页面路径。                      | [navigation 路由跳转](./src/navigation/README.md) |

## 通用工具

以下工具分别从 `xbd-utils/utils`、`xbd-utils/verify` 或 `xbd-utils/price` 导入。

| 工具                 | 作用描述                                   | 导入路径           |
| :------------------- | :----------------------------------------- | :----------------- |
| `includes`           | 判断数组或字符串是否包含指定值。           | `xbd-utils/utils`  |
| `isEmpty`            | 判断空值、字符串、数组或普通对象是否为空。 | `xbd-utils/utils`  |
| `isPlainObject`      | 判断值是否为普通对象。                     | `xbd-utils/utils`  |
| `isEqual`            | 递归比较基础值、数组和普通对象。           | `xbd-utils/utils`  |
| `getCurrentPage`     | 获取当前页面栈顶部页面实例。               | `xbd-utils/utils`  |
| `getUnit`            | 为数字补齐样式单位，默认使用 `rpx`。       | `xbd-utils/utils`  |
| `formatStyle`        | 在样式对象和内联 style 字符串之间转换。    | `xbd-utils/utils`  |
| `addPropsPrefix`     | 为对象一级属性名添加指定前缀。             | `xbd-utils/utils`  |
| `isHyperLink`        | 判断字符串是否为超链接。                   | `xbd-utils/verify` |
| `formatPriceToFixed` | 格式化千分位并设置保留小数位。             | `xbd-utils/price`  |

## 开发命令

在仓库根目录执行：

```bash
pnpm --filter xbd-utils build
pnpm --filter xbd-utils type-check
pnpm --filter xbd-utils test
```
