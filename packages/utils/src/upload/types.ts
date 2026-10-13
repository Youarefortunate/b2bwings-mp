import type {
  TransportConfig,
  TransportInfo,
  TransportOptions,
} from "../transport/types";
import type {
  UploadFileStatus,
  UploadMode,
  UploadSettledStatus,
} from "./enums";

/** 上传文件信息 */
export interface UploadFile {
  /** 本地临时文件路径 */
  path: string;
  /** 文件大小，单位 B */
  size: number;
  /** 文件名 */
  name?: string;
  /** 文件类型 */
  type?: string;
  /** 上传任务 ID */
  taskId: string;
  /** 上传状态 */
  status?: UploadFileStatus;
  /** 上传进度百分比 */
  percent?: number;
  /** 视频时长 */
  duration?: number;
  /** 图片或视频高度 */
  height?: number;
  /** 图片或视频宽度 */
  width?: number;
  /** 视频缩略图临时路径 */
  thumbTempFilePath?: string;
  /** 聊天文件发送时间 */
  time?: number;
}

/** 上传成功回调数据 */
export interface UploadSuccessPayload<R = unknown> {
  /** 当前回调涉及的文件 */
  files: UploadFile[];
  /** 上传响应 */
  response: R;
}

/** 上传失败回调数据 */
export interface UploadErrorPayload<E = unknown> {
  /** 当前回调涉及的文件 */
  files: UploadFile[];
  /** 上传错误 */
  error: E;
}

/** 上传通用配置 */
export interface UploadConfig extends TransportConfig {
  /** 是否选择文件后立即上传 */
  autoUpload?: boolean;
  /** 多文件上传调度模式 */
  mode?: UploadMode;
  /** pool 模式并发数 */
  concurrency?: number;
}

/** 上传实例初始化选项 */
export interface UploadOptions extends TransportOptions<UploadConfig> {
  /** 默认上传路径 */
  defaultUploadUrl?: string;
  /** 默认上传字段名 */
  name?: string;
  /** 默认文件大小限制，number 按 MB 处理 */
  maxSize?: number | string;
  /** 允许上传的文件扩展名 */
  allowedExts?: string[];
  /** 是否选择文件后立即上传 */
  autoUpload?: boolean;
  /** 多文件上传调度模式 */
  mode?: UploadMode;
  /** pool 模式并发数，默认为 3 */
  concurrency?: number;
}

/** 上传执行选项 */
export interface UploadExecutionOptions<
  R = unknown,
  E = unknown,
> extends Partial<TransportInfo<UploadConfig>> {
  /** 待上传文件列表 */
  files?: readonly UploadFile[];
  /** 上传字段名 */
  name?: string;
  /** 表单额外数据 */
  data?: WechatMiniprogram.IAnyObject;
  /** 文件大小限制，number 按 MB 处理 */
  maxSize?: number | string;
  /** 允许上传的文件扩展名 */
  allowedExts?: string[];
  /** 上传前校验钩子 */
  beforeUpload?: (uploadInfo: UploadInfo<R, E>) => Promise<void> | void;
  /** 选择文件完成回调 */
  onSelectComplete?: (files: UploadFile[]) => void;
  /** 文件状态变化回调 */
  onStatusChange?: (data: {
    /** 上传任务 ID */
    taskId: string;
    /** 上传状态 */
    status: UploadFileStatus;
    /** 当前文件 */
    file: UploadFile;
    /** 当前批次所有文件 */
    files: UploadFile[];
  }) => void;
  /** 上传进度回调 */
  onProgress?: (
    data: Parameters<WechatMiniprogram.UploadTaskOnProgressUpdateCallback>[0] & {
      /** 当前批次所有文件 */
      files: UploadFile[];
    },
  ) => void;
  /** 上传任务创建回调 */
  onTask?: (task: WechatMiniprogram.UploadTask) => void;
  /** 上传成功回调 */
  onSuccess?: (data: UploadSuccessPayload<R>) => void;
  /** 上传失败回调 */
  onError?: (data: UploadErrorPayload<E>) => void;
  /** 上传前校验失败回调 */
  onBeforeUploadError?: (data: UploadErrorPayload<E>) => void;
}

/** 媒体文件选择上传选项 */
export type ChooseMediaUploadOptions<R = unknown, E = unknown> = Omit<
  WechatMiniprogram.ChooseMediaOption,
  "success" | "fail" | "complete"
> &
  Omit<UploadExecutionOptions<R, E>, "files">;

/** 聊天文件选择上传选项 */
export type ChooseMessageFileUploadOptions<R = unknown, E = unknown> = Omit<
  WechatMiniprogram.ChooseMessageFileOption,
  "count" | "success" | "fail" | "complete"
> &
  Partial<Pick<WechatMiniprogram.ChooseMessageFileOption, "count">> &
  Omit<UploadExecutionOptions<R, E>, "files">;

/** 根据文件列表推导上传响应 */
export type UploadResponseForFiles<
  R,
  F extends readonly UploadFile[],
> = number extends F["length"]
  ? R | R[]
  : F extends readonly [UploadFile]
    ? R
    : R[];

/** 根据文件列表与自动上传配置推导上传结果 */
export type UploadResultForOptions<
  R,
  E,
  F extends readonly UploadFile[],
  A extends boolean | undefined,
> = A extends false
  ? DeferredUploadResult<R, E>
  : A extends true
    ? UploadResponseForFiles<R, F>
    : UploadResponseForFiles<R, F> | DeferredUploadResult<R, E>;

/** 必须包含文件的上传执行选项 */
export type UploadActionOptions<
  R = unknown,
  E = unknown,
  F extends readonly UploadFile[] = readonly UploadFile[],
> = Omit<UploadExecutionOptions<R, E>, "files"> & {
  files: F & (F extends readonly [] ? never : unknown);
};

/** 上传调用信息 */
export interface UploadInfo<R = unknown, E = unknown>
  extends
    TransportInfo<UploadConfig>,
    Omit<
      UploadExecutionOptions<R, E>,
      keyof TransportInfo<UploadConfig> | "files"
    > {
  /** 待上传文件列表 */
  files: UploadFile[];
}

/** 单文件上传成功结果 */
export interface UploadFulfilledResult<R = unknown> {
  /** 文件快照 */
  file: UploadFile;
  /** 上传结果状态 */
  status: UploadSettledStatus.Fulfilled;
  /** 上传响应 */
  response: R;
}

/** 单文件上传失败结果 */
export interface UploadRejectedResult<E = unknown> {
  /** 文件快照 */
  file: UploadFile;
  /** 上传结果状态 */
  status: UploadSettledStatus.Rejected;
  /** 上传错误 */
  error: E;
}

/** 单文件上传结果 */
export type UploadSettledResult<R = unknown, E = unknown> =
  | UploadFulfilledResult<R>
  | UploadRejectedResult<E>;

/** 上传批次控制器，用于取消排队或活动中的任务 */
export interface UploadBatchController {
  /** 取消指定 taskId 的待上传文件 */
  cancelPending: (taskId: string) => void;
  /** 取消全部待上传文件 */
  cancelAllPending: () => void;
}

/** 延迟上传返回结果 */
export interface DeferredUploadResult<R = unknown, E = unknown> {
  /** 已选择文件列表 */
  files: UploadFile[];
  /** 上传调用信息 */
  uploadInfo: UploadInfo<R, E>;
  /** 触发上传的方法 */
  fetchUpload: () => Promise<R | R[]>;
}

/** 文件选择上传调用返回结果 */
export type UploadResult<R = unknown, E = unknown> = Promise<
  R | R[] | DeferredUploadResult<R, E>
>;
