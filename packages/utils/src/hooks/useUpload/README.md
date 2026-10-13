# 上传 Hook (useUpload)

> 将指定 `Upload` 实例绑定为上传 Hook，统一管理单批次文件、进度、状态、响应和错误。

## 使用示例

### 1. 工厂创建与基础直接上传

`xbd-utils` 不直接提供已绑定的 `useUpload`。业务侧需先创建 `Upload` 实例，再通过 `createUseUpload(upload)` 创建 Hook。

```ts
import {
  createUseUpload,
  Upload,
  UploadAggregateError,
  UploadMode,
} from "xbd-utils";

type UploadResponse = { url: string };
type UploadError = { errMsg: string };

const upload = Upload.create<UploadResponse, UploadError>({
  baseUrl: "https://api.example.com",
  defaultUploadUrl: "/file/upload",
  mode: UploadMode.Queue,
});
const useUpload = createUseUpload(upload);
const { state, upload: runUpload } = useUpload();

const response = await runUpload({
  files: [
    {
      path: tempFilePath,
      size: fileSize,
      taskId: "avatar",
    },
  ],
});

console.log(response);
console.log(state.status, state.progress, state.response);
```

### 2. 应用级请求与上传共用认证策略

`Request` 和 `Upload` 都继承相同的传输拦截器能力。应用可复用一个请求拦截函数，在每次请求或上传前读取最新凭证，避免把易变 Token 固定在实例初始化配置中。

```ts
import { Request, Upload } from "xbd-utils";
import type { TransportInfo } from "xbd-utils";
import { getToken } from "@/utils/session";

const appendAuthHeader = <T extends TransportInfo>(options: T): T => {
  const token = getToken();
  if (token) options.header = { ...options.header, iToken: token };
  return options;
};

export const request = Request.create({ baseUrl: API_BASE_URL });
export const upload = Upload.create({
  baseUrl: API_BASE_URL,
  defaultUploadUrl: "/file/upload",
});

request.interceptors.request.use(appendAuthHeader);
upload.interceptors.request.use(appendAuthHeader);
```

### 3. 选择媒体文件或聊天文件

```ts
const { state, chooseMedia, chooseMessageFile } = useUpload({
  allowedExts: ["jpg", "jpeg", "png", "pdf"],
  maxSize: 5,
});

await chooseMedia({
  count: 1,
  mediaType: ["image"],
  sourceType: ["album", "camera"],
});

await chooseMessageFile({
  count: 1,
  type: "file",
  extension: ["pdf"],
});

console.log(state.files, state.loading, state.error);
```

### 4. 延迟上传 (`autoUpload: false`)

`autoUpload: false` 适用于 `chooseMedia`、`chooseMessageFile` 和底层 `upload` 选择流程。选择方法会返回 `DeferredUploadResult`，调用 `fetchUpload()` 后才开始上传；同一个结果重复调用会复用第一次上传 Promise，不会重复发网。直接调用 Hook 的 `upload()` 时，显式传入 `autoUpload: true` 会保留单文件 `R`、多文件 `R[]` 的立即上传响应推导，显式传入 `autoUpload: false` 会返回 `DeferredUploadResult<R, E>`，未指定时则返回两者的安全联合类型。

```ts
import type { DeferredUploadResult } from "xbd-utils";

const { state, chooseMedia } = useUpload({ autoUpload: false });
const result = (await chooseMedia({ count: 1 })) as DeferredUploadResult<
  UploadResponse,
  UploadError
>;

console.log(state.status, result.files); // ready
await result.fetchUpload();
console.log(state.status, state.response); // success
```

## Options 参数

`useUpload(options)` 接收默认上传选项；调用 `chooseMedia`、`chooseMessageFile` 或 `upload` 时传入的同名选项优先。回调仅通过这两层 Options 配置，不会因重复调用或重复注册而累积。

| 参数名 | 说明 | 类型 | 默认值 | 是否必填 |
| :--- | :--- | :--- | :--- | :--- |
| `url` | 上传地址，可结合 `Upload` 的 `baseUrl` 使用。 | String | `Upload.defaultUploadUrl` | 否 |
| `timeout` | 上传超时时间。 | Number | `Upload.timeout` | 否 |
| `header` | 请求头。 | Object | `undefined` | 否 |
| `name` | 文件字段名。 | String | `Upload.name` | 否 |
| `data` | 额外表单数据。 | Object | `undefined` | 否 |
| `maxSize` | 文件大小限制；Number 按 MB 处理，也支持带 `m`、`k`、`b` 单位的字符串。 | Number \| String | `Upload.maxSize` | 否 |
| `allowedExts` | 允许上传的文件扩展名。 | String[] | `Upload.allowedExts` | 否 |
| `autoUpload` | 选择文件后是否立即上传。 | Boolean | `Upload.autoUpload` | 否 |
| `mode` | 多文件调度模式：`UploadMode.Queue` 串行上传，`UploadMode.Pool` 并发上传。 | UploadMode | `UploadMode.Pool` | 否 |
| `concurrency` | `pool` 模式并发数；会取整并限制在 1～10，非有限数回退为 3。 | Number | `3` | 否 |
| `beforeUpload` | 上传前校验钩子。 | Function | `undefined` | 否 |
| `onSelectComplete` | 文件选择完成回调。 | Function | `undefined` | 否 |
| `onStatusChange` | 文件状态变化回调。 | Function | `undefined` | 否 |
| `onProgress` | 上传进度回调。 | Function | `undefined` | 否 |
| `onTask` | 上传任务创建回调。 | Function | `undefined` | 否 |
| `onSuccess` | 上传成功回调。 | Function | `undefined` | 否 |
| `onError` | 上传失败回调。 | Function | `undefined` | 否 |
| `onBeforeUploadError` | 上传前校验失败回调。 | Function | `undefined` | 否 |

## State 状态

| 字段名 | 说明 | 类型 |
| :--- | :--- | :--- |
| `state.files` | 当前批次文件。 | UploadFile[] |
| `state.status` | 当前批次状态：`idle`、`ready`、`uploading`、`success`、`error` 或 `canceled`。 | UseUploadStatus |
| `state.progress` | 当前批次上传进度；多文件时按文件大小加权计算。 | Number |
| `state.loading` | 是否正在上传。 | Boolean |
| `state.error` | 当前批次错误。 | E \| TransportError \| Error \| null |
| `state.response` | 当前批次响应；单文件为 R，多文件为 R[]。 | R \| R[] \| null |

## 返回方法

| 方法名 | 说明 | 类型 |
| :--- | :--- | :--- |
| `chooseMedia` | 调用 `wx.chooseMedia` 选择媒体文件，并按配置上传或返回延迟上传结果。 | `(options?) => Promise<R \| R[] \| DeferredUploadResult<R, E>>` |
| `chooseMessageFile` | 调用 `wx.chooseMessageFile` 选择聊天文件，并按配置上传或返回延迟上传结果。 | `(options?) => Promise<R \| R[] \| DeferredUploadResult<R, E>>` |
| `upload` | 根据 `autoUpload` 配置执行或延迟上传传入的 `files`；立即上传时保留单/多文件响应推导。 | `(options) => Promise<R \| R[] \| DeferredUploadResult>` |
| `cancel` | 按任务 ID 委托当前 `Upload` 实例取消任务。 | `(taskId: string) => void` |
| `cancelAll` | 委托当前 `Upload` 实例取消全部任务。 | `() => void` |
| `reset` | 清空 Hook 状态并使旧批次回调失效，不取消底层任务。 | `() => void` |

## 回调配置与执行顺序

上传通知回调仅通过 `useUpload(options)` 默认 Options 和本次 `chooseMedia`、`chooseMessageFile`、`upload` 的单次 Options 传入。同一回调按 Hook 内部状态更新、默认回调、单次回调的固定顺序执行；每个通知型回调的同步异常都会独立隔离，不会阻塞后续回调或改变上传 Promise 结果。

多文件上传时，`onTask`、`onSuccess` 和 `onError` 均按文件触发，后两者的 `files` 仅包含当前文件；`onStatusChange` 也按文件触发，并同时提供当前 `file` 与完整批次 `files` 快照。`onProgress` 由当前文件任务触发，其 `files` 保留完整批次快照。Hook 会合并逐文件快照，避免后完成的文件覆盖同批次其他文件状态，并按每个文件的大小与进度计算加权批次进度。某个文件上传前校验失败时，只要批次仍有其他文件处于 `uploading`，Hook 会保持 `uploading/loading`，最终再按聚合结果进入终态。

直接传递依赖组件或页面实例的普通方法会丢失 `this`，应使用箭头函数包装或显式 `bind`：

```ts
const uploader = useUpload({
  onSuccess: (data) => this.handleUpload(data),
});

await uploader.chooseMedia({
  count: 1,
  onError: this.handleUploadError.bind(this),
});
```

## 单批次与重置、取消

每次调用 `chooseMedia`、`chooseMessageFile` 或 `upload` 都会开启新批次并清空上一批次状态。新批次开始后，旧批次回调不会覆盖当前状态。

`reset()` 仅重置状态并隔离旧回调，不取消任务；如需终止网络上传，应先调用 `cancel(taskId)` 或 `cancelAll()`。取消状态由底层上传任务失败回调同步，调用取消方法本身不会直接改写 Hook 状态。

## 多文件返回与聚合错误

底层 `Upload` 默认使用 `UploadMode.Pool` 并发上传，`concurrency` 默认 3，并会被限制在 1～10；如需串行上传，可切换为 `UploadMode.Queue`。Hook Options 与单次操作 Options 均可覆盖实例配置，单次配置优先。

同一个 `Upload` 实例中的活动 `taskId` 必须唯一；批次内重复或与其他活动批次冲突时会在发网前拒绝。批次结算后 ID 自动释放，可用于后续重试。

立即上传时，单文件成功后 Promise 返回该文件响应，多文件全部成功后返回按传入文件原始顺序排列的响应数组；延迟上传时，`upload()` 返回 `DeferredUploadResult`，由 `fetchUpload()` 返回对应响应。逐文件成功过程中，`state.response` 会更新为最近完成文件的响应；整个批次完成后会更新为最终响应或响应数组。

单文件失败时 Promise 保留原始错误；多文件存在失败或取消时，底层会等待已调度任务结算后抛出 `UploadAggregateError`。Hook 将其保存在 `state.error` 并保持 Promise 拒绝，`error.results` 包含按文件原始顺序排列的成功与失败结果，`error.errors` 包含各失败文件的原始错误。

```ts
try {
  await uploader.upload({
    files,
    mode: UploadMode.Pool,
    concurrency: 3,
  });
} catch (error) {
  if (error instanceof UploadAggregateError) {
    console.log(error.results, error.errors);
  }
}
```
