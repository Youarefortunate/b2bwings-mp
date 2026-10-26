# hooks 请求 Hook

[工具索引](../../README.md) · [首页](../../../../README.md)

`xbd-utils/hooks` 公开导出 Hook 工厂。先创建请求或上传实例，再通过工厂生成业务侧使用的 Hook。

## 工具列表

| 工具                   | 作用描述                                                       |
| :--------------------- | :------------------------------------------------------------- |
| `createUseRequest`     | 绑定 `Request` 实例，创建管理单接口请求状态的 `useRequest`。   |
| `createUsePageRequest` | 绑定 `Request` 实例，创建管理分页请求状态的 `usePageRequest`。 |
| `createUseUpload`      | 绑定 `Upload` 实例，创建管理单批次上传状态的 `useUpload`。     |

## 创建请求 Hooks

```ts
import { createUsePageRequest, createUseRequest } from "xbd-utils/hooks";
import { Request } from "xbd-utils/request";

const request = Request.create({
  baseUrl: "https://api.example.com",
});

const useRequest = createUseRequest(request);
const usePageRequest = createUsePageRequest(request);
```

## createUseUpload

先创建独立 `Upload` 实例，再生成业务侧 Hook。完整选项、状态和示例见 [useUpload/README.md](./useUpload/README.md)。

```ts
import { createUseUpload } from "xbd-utils/hooks";
import { Upload } from "xbd-utils/upload";

const upload = Upload.create({
  baseUrl: "https://api.example.com",
  defaultUploadUrl: "/file/upload",
});
const useUpload = createUseUpload(upload);
const { chooseMedia } = useUpload({
  onSuccess: (data) => console.log(data.response),
});

await chooseMedia({
  count: 1,
  onProgress: ({ progress }) => console.log(progress),
});
```

回调仅通过 `useUpload(options)` 的默认 Options 和每次操作的单次 Options 配置，不提供动态事件注册器，也不会因重复注册而累积。直接传递依赖 `this` 的普通方法会丢失上下文，应使用箭头函数包装或 `bind(this)`。

## useRequest

### 函数签名

```ts
useRequest<T = any>(config: {
  url: string;
  params?: Record<string, any> | (() => Record<string, any>);
  options?: RequestConfigOptions;
}): UseRequestReturn<T>

useRequest<T = any>(
  url: string,
  params?: Record<string, any> | (() => Record<string, any>),
  options?: RequestConfigOptions,
): UseRequestReturn<T>
```

### 参数列表

| 参数      | 说明                                                                    | 默认值 |
| :-------- | :---------------------------------------------------------------------- | :----- |
| `url`     | 接口地址，支持 `"METHOD /path"` 前缀写法，例如 `"GET /user/detail"`。   | -      |
| `params`  | 初始请求参数，支持对象或返回对象的函数。                                | `{}`   |
| `options` | 请求配置，如 `method`、`load`、`loadText`、`isPrompt`、`timeoutAbort`。 | `{}`   |

### 基础用法

```ts
import { userApis } from "@/apis/user";

interface UserInfo {
  id: string;
  name: string;
}

const { state, fetch, cancel, beforeFetch } = useRequest<UserInfo>({
  url: userApis.detail,
  params: {
    id: "10001",
  },
  options: {
    method: "GET", // options.method 的优先级最高
    load: true,
    loadText: "加载中",
  },
});

const result = await fetch();

console.log(result.data);
console.log(state.loading);
```

### 请求方法

请求方法可通过 `options.method` 指定，也可写在 `url` 前缀中；两种写法都不区分大小写，未指定时默认 `POST`。当两者同时存在时，`options.method` 优先。

```ts
useRequest("GET /user/detail", { id: "10001" });

useRequest(
  "/user/detail",
  { id: "10001" },
  {
    method: "GET",
  },
);
```

### fetch 追加参数

`fetch` 支持传入额外参数，会和初始化参数合并。

```ts
const { fetch } = useRequest("/user/detail", {
  id: "10001",
});

await fetch({
  scene: "edit",
});
```

### beforeFetch

```ts
const { fetch, beforeFetch } = useRequest("/user/detail", {
  id: "10001",
});

beforeFetch((config) => {
  config.header = {
    ...config.header,
    token: wx.getStorageSync("token"),
  };
});

await fetch();
```

### cancel

```ts
const { fetch, cancel } = useRequest("/user/detail", {
  id: "10001",
});

fetch();
cancel();
```

### 返回值

| 字段            | 说明             |
| :-------------- | :--------------- |
| `state.code`    | 响应状态码。     |
| `state.data`    | 响应数据。       |
| `state.message` | 响应消息。       |
| `state.loading` | 是否请求中。     |
| `state.error`   | 请求错误。       |
| `fetch`         | 发起请求。       |
| `cancel`        | 取消当前请求。   |
| `beforeFetch`   | 注册请求前回调。 |

## usePageRequest

### 函数签名

```ts
usePageRequest<T = any>(config: {
  url: string;
  params?: Record<string, any> | (() => Record<string, any>);
  options?: RequestConfigOptions;
  pagination?: Partial<PaginationConfig>;
}): UsePageRequestReturn<T>

usePageRequest<T = any>(
  url: string,
  params?: Record<string, any> | (() => Record<string, any>),
  options?: RequestConfigOptions,
  pagination?: Partial<PaginationConfig>,
): UsePageRequestReturn<T>
```

### 参数列表

| 参数         | 说明                                                                    | 默认值 |
| :----------- | :---------------------------------------------------------------------- | :----- |
| `url`        | 接口地址，支持 `"METHOD /path"` 前缀写法，例如 `"GET /order/page"`。    | -      |
| `params`     | 初始请求参数，支持对象或返回对象的函数。                                | `{}`   |
| `options`    | 请求配置，如 `method`、`load`、`loadText`、`isPrompt`、`timeoutAbort`。 | `{}`   |
| `pagination` | 分页配置，可传 `current`、`size`、`total` 等。                          | `{}`   |

### 基础用法

```ts
import { orderApis } from "@/apis/order";

interface OrderItem {
  id: string;
  name: string;
}

const {
  state,
  fetch,
  refresh,
  cancel,
  pagination,
  beforeFetch,
  afterFetch,
} = usePageRequest<OrderItem>({
  url: orderApis.page,
  params: {
    status: "pending",
  },
  options: {
    method: "POST",
    load: true,
    loadText: "加载中",
  },
  pagination: {
    current: 1,
    size: 10,
  },
});

const result = await fetch();

console.log(result.record);
console.log(state.total);
console.log(state.hasMore);
```

### 请求方法

请求方法可通过 `options.method` 指定，也可写在 `url` 前缀中；两种写法都不区分大小写，未指定时默认 `POST`。当两者同时存在时，`options.method` 优先。

```ts
usePageRequest("GET /order/page", {}, {}, { current: 1, size: 10 });

usePageRequest(
  "/order/page",
  {},
  {
    method: "GET",
  },
  { current: 1, size: 10 },
);
```

### refresh

`refresh` 会把当前页重置为第一页后重新请求。

```ts
await refresh();
```

### 分页参数

`usePageRequest` 请求时会自动追加 `current` 和 `size`。

```ts
const { fetch } = usePageRequest(
  "/order/page",
  {},
  {},
  {
    current: 1,
    size: 20,
  },
);

await fetch();
```

### afterFetch

```ts
afterFetch((response) => {
  console.log("分页请求完成", response.code, response.message);
});
```

### 返回值

| 字段            | 说明                     |
| :-------------- | :----------------------- |
| `state.loading` | 是否请求中。             |
| `state.record`  | 当前列表数据。           |
| `state.total`   | 总数据量。               |
| `state.code`    | 响应状态码。             |
| `state.message` | 响应消息。               |
| `state.error`   | 请求错误。               |
| `state.hasMore` | 是否还有更多数据。       |
| `fetch`         | 发起分页请求。                     |
| `refresh`       | 重置到第一页并重新请求。           |
| `next`          | 请求下一页，失败时回滚当前页码。   |
| `loadMore`      | 非加载且有更多数据时请求下一页。   |
| `reset`         | 重置页码、总数、列表和分页状态。   |
| `cancel`        | 取消当前请求。                     |
| `pagination`    | 分页配置。                         |
| `beforeFetch`   | 注册请求前回调。         |
| `afterFetch`    | 注册请求完成回调。       |

