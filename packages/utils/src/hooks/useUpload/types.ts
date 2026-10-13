import type { TransportError } from "../../transport/types";
import type Upload from "../../upload/index";
import type { UploadFileStatus } from "../../upload/enums";
import type {
  ChooseMediaUploadOptions,
  ChooseMessageFileUploadOptions,
  DeferredUploadResult,
  UploadExecutionOptions,
  UploadFile,
} from "../../upload/types";

/**
 * Hook 上传状态
 * @description 上传状态包括空闲、上传中、上传成功、上传失败、上传取消等
 * @enum {string}
 * @property {"idle"} idle - 空闲状态
 * @property {"ready"} ready - 就绪状态-准备上传
 * @property {"uploading"} uploading - 上传中状态
 * @property {"success"} success - 上传成功状态
 * @property {"error"} error - 上传失败状态
 * @property {"canceled"} canceled - 上传取消状态
 */
export type UseUploadStatus = "idle" | UploadFileStatus;

/** Hook 默认上传选项 */
export type UseUploadOptions<R = unknown, E = unknown> = Omit<
  UploadExecutionOptions<R, E>,
  "files"
>;

/** Hook 上传状态数据 */
export interface UseUploadState<R = unknown, E = unknown> {
  /** 当前批次文件 */
  readonly files: UploadFile[];
  /** 当前批次状态 */
  readonly status: UseUploadStatus;
  /** 当前批次上传进度 */
  readonly progress: number;
  /** 是否正在上传 */
  readonly loading: boolean;
  /** 当前批次错误 */
  readonly error: E | TransportError | Error | null;
  /** 当前批次响应 */
  readonly response: R | R[] | null;
}

/** Hook 上传方法 */
export type UseUploadMethod<R = unknown, E = unknown> = Upload<R, E>["upload"];

/** useUpload 返回对象 */
export type UseUploadReturn<R = unknown, E = unknown> = {
  /** 当前上传状态 */
  state: UseUploadState<R, E>;
  /** 选择媒体文件并按配置上传 */
  chooseMedia: (
    options?: ChooseMediaUploadOptions<R, E>,
  ) => Promise<R | R[] | DeferredUploadResult<R, E>>;
  /** 选择聊天文件并按配置上传 */
  chooseMessageFile: (
    options?: ChooseMessageFileUploadOptions<R, E>,
  ) => Promise<R | R[] | DeferredUploadResult<R, E>>;
  /** 根据自动上传配置执行或延迟上传 */
  upload: UseUploadMethod<R, E>;
  /** 取消指定上传任务 */
  cancel: (taskId: string) => void;
  /** 取消全部上传任务 */
  cancelAll: () => void;
  /** 重置上传状态 */
  reset: () => void;
};

/** 自定义上传 Hook */
export type UseUpload<R = unknown, E = unknown> = (
  options?: UseUploadOptions<R, E>,
) => UseUploadReturn<R, E>;
