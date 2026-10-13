/** 上传文件状态 */
export enum UploadFileStatus {
  /** 就绪状态 */
  Ready = "ready",
  /** 上传中状态 */
  Uploading = "uploading",
  /** 上传成功状态 */
  Success = "success",
  /** 上传失败状态 */
  Error = "error",
  /** 上传取消状态 */
  Canceled = "canceled",
}

/** 多文件上传调度模式 */
export enum UploadMode {
  /** 队列模式，按文件顺序逐个上传 */
  Queue = "queue",
  /** 并发池模式 */
  Pool = "pool",
}

/** 单文件上传结算状态 */
export enum UploadSettledStatus {
  /** 上传成功 */
  Fulfilled = "fulfilled",
  /** 上传失败，包含取消 */
  Rejected = "rejected",
}

/** 上传回调事件名 */
export enum UploadCallbackEvent {
  /** 选择文件完成 */
  OnSelectComplete = "onSelectComplete",
  /** 文件状态变化 */
  OnStatusChange = "onStatusChange",
  /** 上传进度变化 */
  OnProgress = "onProgress",
  /** 上传任务创建 */
  OnTask = "onTask",
  /** 上传成功 */
  OnSuccess = "onSuccess",
  /** 上传失败 */
  OnError = "onError",
  /** 上传前校验失败 */
  OnBeforeUploadError = "onBeforeUploadError",
}
