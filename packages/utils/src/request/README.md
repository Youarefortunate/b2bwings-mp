# request 请求工具

## 工具列表

| 工具                        | 作用描述                                                                                                  |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **`request`**               | **通用请求方法**：接收完整请求配置，适合需要直接指定 `method`、`data`、`header`、`timeout` 等配置的场景。 |
| **`get`**                   | **GET 请求快捷方法**：按 `url`、`data`、`options` 发起 GET 请求。                                         |
| **`post`**                  | **POST 请求快捷方法**：按 `url`、`data`、`options` 发起 POST 请求。                                       |
| **`put`**                   | **PUT 请求快捷方法**：按 `url`、`data`、`options` 发起 PUT 请求。                                         |
| **`delete`**                | **DELETE 请求快捷方法**：按 `url`、`data`、`options` 发起 DELETE 请求。                                   |
| **`interceptors.request`**  | **请求前拦截器**：在发起请求前修改或校验最终请求配置。                                                    |
| **`interceptors.response`** | **响应拦截器**：统一处理后端响应数据，返回业务实际需要的数据结构。                                        |
| **`interceptors.end`**      | **请求完成拦截器**：请求结束后执行收尾逻辑。                                                              |
| **`interceptors.error`**    | **请求错误拦截器**：统一处理请求错误、超时和业务异常。                                                    |

## 创建请求实例

从 `xbd-utils/request` 导入 `Request` 并创建实例，后续请求方法和拦截器都通过该实例使用。

```ts
import { Request } from "xbd-utils/request";

const request = Request.create({
  baseUrl: "https://api.example.com",
});
```

## request

### 函数签名

```ts
request<T = any>(options: RequestInfo): Promise<T>
```

### 参数列表

| 参数           | 说明                                                                  | 默认值   |
| :------------- | :-------------------------------------------------------------------- | :------- |
| `url`          | 接口地址，支持 `"METHOD /path"` 前缀写法，例如 `"GET /user/detail"`。 | -        |
| `method`       | 请求方法，优先级高于 `url` 前缀中的请求方法；未指定时默认 `POST`。    | `POST`   |
| `data`         | 请求参数。                                                            | -        |
| `header`       | 请求头。                                                              | -        |
| `timeout`      | 超时时间。                                                            | -        |
| `isPrompt`     | 请求失败时是否自动提示。                                              | `true`   |
| `load`         | 是否显示 Loading。                                                    | `true`   |
| `loadText`     | Loading 文案。                                                        | `加载中` |
| `isFactory`    | 是否使用响应数据工厂处理返回值。                                      | `true`   |
| `timeoutAbort` | 请求超时时是否主动中断请求任务。                                      | `true`   |

### 基础用法

```ts
const result = await request.request({
  url: "/user/update",
  method: "PUT",
  data: {
    id: "10001",
    name: "李四",
  },
  load: true,
  loadText: "保存中",
});
```

也可以在 `url` 前使用请求方法前缀，前缀与接口地址以空格分隔，大小写不敏感。

```ts
const result = await request.request({
  url: "put /user/update",
  data: {
    id: "10001",
    name: "李四",
  },
});
```

请求方法优先级为：`options.method` 显式值 > `url` 前缀 method > 请求实例默认 method > `POST`。

## get / post / put / delete

### 函数签名

```ts
get<T = any>(url: string, data?: Record<string, any>, options?: RequestConfig): Promise<T>
post<T = any>(url: string, data?: Record<string, any>, options?: RequestConfig): Promise<T>
put<T = any>(url: string, data?: Record<string, any>, options?: RequestConfig): Promise<T>
delete<T = any>(url: string, data?: Record<string, any>, options?: RequestConfig): Promise<T>
```

### 参数列表

| 参数      | 说明                                                                    | 默认值 |
| :-------- | :---------------------------------------------------------------------- | :----- |
| `url`     | 接口地址，通用请求链路支持 `"METHOD /path"` 前缀写法。                  | -      |
| `data`    | 请求参数。                                                              | `{}`   |
| `options` | 单次请求配置，可传 Loading、提示、数据工厂、超时中断、`method` 等配置。 | `{}`   |

### 基础用法

```ts
interface UserInfo {
  id: string;
  name: string;
}

const user = await request.get<UserInfo>("/user/detail", {
  id: "10001",
});

const result = await request.post(
  "/user/create",
  {
    name: "张三",
  },
  {
    load: true,
    loadText: "提交中",
  },
);
```

## options 配置说明

| 配置           | 说明                             | 默认值   |
| :------------- | :------------------------------- | :------- |
| `isPrompt`     | 请求失败时是否自动提示。         | `true`   |
| `load`         | 是否显示 Loading。               | `true`   |
| `loadText`     | Loading 文案。                   | `加载中` |
| `isFactory`    | 是否使用响应数据工厂处理返回值。 | `true`   |
| `timeoutAbort` | 请求超时时是否主动中断请求任务。 | `true`   |

## 请求拦截器

```ts
request.interceptors.request.use((requestInfo) => {
  requestInfo.header = {
    ...requestInfo.header,
    token: wx.getStorageSync("token"),
  };

  return requestInfo;
});
```

## 响应拦截器

```ts
request.interceptors.response.use((dispatchResult) => {
  const response = dispatchResult.response;

  if (response?.code !== 200) {
    throw {
      statusCode: response?.code || 0,
      errMsg: response?.message || "请求失败",
      response,
    };
  }

  return response.data;
});
```

## 请求完成拦截器

```ts
request.interceptors.end.use((requestInfo) => {
  console.log("请求结束", requestInfo.url);
});
```

## 请求错误拦截器

```ts
request.interceptors.error.use((error) => {
  wx.showToast({
    title: error.errMsg || "请求失败",
    icon: "none",
  });

  throw error;
});
```
