# 上传管理器 (Upload)

> 封装微信文件选择、校验、调度、上传、进度通知与任务取消，支持多文件串行或并发上传。

## 导入方式

```ts
import { Upload, UploadAggregateError, UploadMode } from "xbd-utils/upload";
```

## UploadMode

| 枚举值 | 实际值 | 说明 |
| :--- | :--- | :--- |
| `UploadMode.Queue` | `queue` | 队列模式，按 `files` 原始顺序逐个上传。 |
| `UploadMode.Pool` | `pool` | 并发池模式，最多同时上传 `concurrency` 个文件；这是默认模式。 |

## 创建实例

```ts
type UploadResponse = { url: string };

const upload = Upload.create<UploadResponse>({
  baseUrl: "https://api.example.com",
  defaultUploadUrl: "/file/upload",
  mode: UploadMode.Pool,
  concurrency: 3,
});
```

### UploadOptions

| 参数名 | 说明 | 类型 | 默认值 | 是否必填 |
| :--- | :--- | :--- | :--- | :--- |
| `baseUrl` | 上传地址基础路径。 | String | `""` | 否 |
| `defaultUploadUrl` | 默认上传路径。 | String | `""` | 否 |
| `timeout` | 上传超时时间。 | Number | `6000` | 否 |
| `header` | 实例默认请求头。 | Object | `{}` | 否 |
| `name` | 文件字段名。 | String | `file` | 否 |
| `maxSize` | 文件大小限制；Number 按 MB 处理，也支持带 `m`、`k`、`b` 单位的字符串。 | Number \| String | `3` | 否 |
| `allowedExts` | 允许上传的文件扩展名。 | String[] | `["jpg", "jpeg", "png"]` | 否 |
| `autoUpload` | 选择文件后是否立即上传。 | Boolean | `true` | 否 |
| `mode` | 多文件调度模式。 | UploadMode | `UploadMode.Pool` | 否 |
| `concurrency` | `pool` 模式并发数；会取整并限制在 1～10，非有限数回退为 3。 | Number | `3` | 否 |

调用 `upload`、`chooseMedia` 或 `chooseMessageFile` 时，可以通过同名执行选项覆盖实例的 `url`、`timeout`、`header`、`name`、`maxSize`、`allowedExts`、`autoUpload`、`mode` 与 `concurrency`。

## 上传文件

```ts
const responses = await upload.upload({
  files: selectedFiles,
  mode: UploadMode.Pool,
  concurrency: 3,
  onSuccess: ({ files, response }) => {
    console.log(files[0].taskId, response);
  },
  onError: ({ files, error }) => {
    console.error(files[0].taskId, error);
  },
});
```

### 逐文件回调

多文件上传会为每个文件单独创建上传任务。以下回调按文件触发，而不是等整个批次结束后只触发一次：

| 回调 | 触发行为 |
| :--- | :--- |
| `onStatusChange` | 当前文件状态或进度变化时触发；`file` 是当前文件快照，`files` 是当前批次快照。 |
| `onTask` | 每个底层 `UploadTask` 创建后触发。 |
| `onSuccess` | 单个文件成功后触发；`files` 仅包含该文件，`response` 是该文件响应。 |
| `onError` | 单个文件网络上传失败或取消后触发；`files` 仅包含该文件，`error` 是该文件错误。 |
| `onBeforeUploadError` | 自定义批次校验失败时携带整批文件；默认大小或扩展名校验失败时按文件触发。 |

`onProgress` 由当前文件的底层任务触发，回调中的 `files` 保留整个批次快照。所有通知型回调的同步异常都会被隔离，不会中断上传调度或改变 Promise 结果。

默认大小与扩展名校验按文件执行。某个文件校验或网络上传失败后，该文件进入 `error`，同时释放队列位置或并发槽位，后续文件继续调度；整个批次结算后再抛出聚合错误。自定义 `beforeUpload` 仍是批次级钩子，抛错会阻止整批上传。

## 返回值与聚合错误

`Upload<R, E>` 或 `Upload.create<R, E>()` 的泛型 `R` 表示单个文件的响应类型，`E` 表示上传错误类型。显式传入 `autoUpload: true` 时，单文件 tuple（含 readonly tuple）返回 `Promise<R>`，多文件 tuple 返回 `Promise<R[]>`，普通动态 `UploadFile[]` 返回 `Promise<R | R[]>`；显式传入 `autoUpload: false` 时返回 `Promise<DeferredUploadResult<R, E>>`。未在本次调用中指定 `autoUpload` 时，由实例配置决定运行时结果，因此返回上述两类结果的联合类型。已知空 tuple 会在编译期拒绝，动态空数组仍由运行时校验。`onSuccess.response` 推导为 `R`，`onError.error`、`onBeforeUploadError.error` 与 `UploadAggregateError.errors` 推导为 `E`。

- 单文件全部成功：Promise 返回该文件响应。
- 多文件全部成功：Promise 返回响应数组，顺序与传入的 `files` 一致。
- 单文件失败：Promise 直接抛出该文件的原始错误。
- 多文件只要有一个失败或取消：其余已调度文件仍会完成，随后 Promise 抛出 `UploadAggregateError`。

`UploadAggregateError` 继承 `Error`（微信小程序运行环境未提供 `AggregateError`，故自行聚合）：

| 字段 | 说明 | 类型 |
| :--- | :--- | :--- |
| `errors` | 所有失败文件的原始错误。 | E[] |
| `results` | 按传入文件原始顺序排列的全部结果；成功项包含 `response`，失败项包含 `error`。 | UploadSettledResult[] |
| `message` | 固定错误信息。 | `部分文件上传失败` |

```ts
try {
  const responses = await upload.upload({ files });
  console.log(responses);
} catch (error) {
  if (error instanceof UploadAggregateError) {
    error.results.forEach((result) => {
      if (result.status === "fulfilled") {
        console.log(result.file.taskId, result.response);
      } else {
        console.error(result.file.taskId, result.error);
      }
    });
  }
}
```

## 文件选择与延迟上传

`chooseMedia` 和 `chooseMessageFile` 会在选择成功后进入相同的上传调度流程。设置 `autoUpload: false` 时，它们与 `upload` 都返回 `DeferredUploadResult`；调用 `fetchUpload()` 才会开始上传。每个延迟结果只会启动一次上传，重复调用 `fetchUpload()` 会复用第一次调用的 Promise 与结果。

```ts
const result = await upload.chooseMedia({
  count: 3,
  autoUpload: false,
});

if ("fetchUpload" in result) {
  await result.fetchUpload();
}
```

## 取消任务

同一个 `Upload` 实例中，批次内及同时活动批次之间的 `taskId` 必须唯一。重复 ID 会在发起网络请求前拒绝，并返回 `上传任务 ID 不能重复：<taskId>`。批次结算后 ID 会自动释放，可用于后续重试。

- `cancel(taskId)`：取消指定任务；任务尚未出列或尚未创建底层 `UploadTask` 时，会直接将对应文件标记为 `canceled`，其他文件继续调度。
- `cancelAll()`：取消当前实例已创建的全部任务，并将活跃批次中尚未调度的文件标记为 `canceled`，阻止其继续发起网络请求。

取消方法不会向调用栈同步抛出底层 `abort()` 异常；活动任务会以 `uploadFile:fail abort` 拒绝并释放任务记录。上传结算后迟到的进度回调会被忽略，不会覆盖最终状态或重复通知。
