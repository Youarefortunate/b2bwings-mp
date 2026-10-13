import type Upload from "../../upload/index";
import { UploadAggregateError } from "../../upload/index";
import { UploadCallbackEvent, UploadFileStatus } from "../../upload/enums";
import type { TransportError } from "../../transport/types";
import type {
  ChooseMediaUploadOptions,
  ChooseMessageFileUploadOptions,
  DeferredUploadResult,
  UploadActionOptions,
  UploadExecutionOptions,
  UploadFile,
} from "../../upload/types";
import type {
  UseUpload,
  UseUploadMethod,
  UseUploadOptions,
  UseUploadReturn,
  UseUploadStatus,
} from "./types";

type UploadCallbacks<R, E> = Pick<
  UploadExecutionOptions<R, E>,
  | "onSelectComplete"
  | "onStatusChange"
  | "onProgress"
  | "onTask"
  | "onSuccess"
  | "onError"
  | "onBeforeUploadError"
>;
type UploadCallbackName = keyof UploadCallbacks<unknown, unknown>;

/**
 * 创建自定义上传 Hook
 * @param upload 上传实例
 */
export function createUseUpload<R, E>(upload: Upload<R, E>): UseUpload<R, E>;
/** 兼容在 Hook 工厂处显式声明响应类型 */
export function createUseUpload<R = unknown, E = unknown>(
  upload: Upload<unknown, unknown>,
): UseUpload<R, E>;
export function createUseUpload<R = unknown, E = unknown>(
  upload: Upload<R, E> | Upload<unknown, unknown>,
): UseUpload<R, E> {
  const runtimeUpload = upload as Upload<R, E>;
  /**
   * 自定义上传 Hook
   * @param options 默认上传配置
   */
  return function useUpload(
    options: UseUploadOptions<R, E> = {},
  ): UseUploadReturn<R, E> {
    let files: UploadFile[] = [];
    let status: UseUploadStatus = "idle";
    let progress = 0;
    let loading = false;
    let error: E | TransportError | Error | null = null;
    let response: R | R[] | null = null;
    let activeBatchId = 0;

    /** 清空当前批次状态 */
    const clearState = () => {
      files = [];
      status = "idle";
      progress = 0;
      loading = false;
      error = null;
      response = null;
    };

    const reset = () => {
      activeBatchId++;
      clearState();
    };

    /** 创建文件状态快照，避免用户回调修改 Hook 内部状态 */
    const snapshotFiles = (nextFiles: UploadFile[]) =>
      nextFiles.map((file) => ({ ...file }));

    /** 按文件大小加权计算当前批次进度 */
    const calculateProgress = (nextFiles: UploadFile[]) => {
      if (!nextFiles.length) return 0;
      const totalSize = nextFiles.reduce(
        (total, file) => total + Math.max(0, file.size),
        0,
      );
      const weightedProgress = nextFiles.reduce(
        (total, file) => total + Math.max(0, file.size) * (file.percent ?? 0),
        0,
      );
      const nextProgress = totalSize
        ? weightedProgress / totalSize
        : nextFiles.reduce((total, file) => total + (file.percent ?? 0), 0) /
          nextFiles.length;
      return Math.max(0, Math.min(100, Math.round(nextProgress)));
    };

    /** 合并逐文件回调快照，保留当前批次其他文件 */
    const mergeFiles = (nextFiles: UploadFile[]) => {
      const nextFileMap = new Map(
        nextFiles.map((file) => [file.taskId, { ...file }]),
      );
      return files.length
        ? files.map((file) => nextFileMap.get(file.taskId) ?? file)
        : snapshotFiles(nextFiles);
    };

    /** 按内部状态、默认配置、单次配置的顺序执行并隔离回调异常 */
    const combine = <K extends UploadCallbackName>(
      name: K,
      actionOptions: UploadExecutionOptions<R, E>,
      callback: NonNullable<UploadCallbacks<R, E>[K]>,
    ) =>
      ((payload: never) => {
        const notify = (nextCallback?: (value: never) => void) => {
          try {
            nextCallback?.(payload);
          } catch {
            // 隔离通知型用户回调异常，不影响上传主流程
          }
        };
        notify(callback as (value: never) => void);
        notify(options[name] as ((value: never) => void) | undefined);
        notify(actionOptions[name] as ((value: never) => void) | undefined);
      }) as NonNullable<UploadCallbacks<R, E>[K]>;

    /** 创建新批次配置，并阻止旧批次回调覆盖当前状态 */
    const prepare = <T extends UploadExecutionOptions<R, E>>(
      actionOptions: T,
    ): T => {
      const batchId = ++activeBatchId;
      clearState();
      const update = (callback: () => void) => {
        if (batchId === activeBatchId) callback();
      };
      return {
        ...options,
        ...actionOptions,
        onSelectComplete: combine(
          UploadCallbackEvent.OnSelectComplete,
          actionOptions,
          (selectedFiles) =>
            update(() => {
              files = snapshotFiles(selectedFiles);
              status = UploadFileStatus.Ready;
            }),
        ),
        onStatusChange: combine(
          UploadCallbackEvent.OnStatusChange,
          actionOptions,
          ({ status: nextStatus, files: nextFiles }) =>
            update(() => {
              files = snapshotFiles(nextFiles);
              if (nextStatus === UploadFileStatus.Uploading) {
                status = UploadFileStatus.Uploading;
                loading = true;
              }
            }),
        ),
        onProgress: combine(
          UploadCallbackEvent.OnProgress,
          actionOptions,
          (data) =>
            update(() => {
              files = snapshotFiles(data.files);
              progress = calculateProgress(files);
            }),
        ),
        onSuccess: combine(
          UploadCallbackEvent.OnSuccess,
          actionOptions,
          ({ files: nextFiles, response: nextResponse }) =>
            update(() => {
              files = mergeFiles(nextFiles);
              progress = calculateProgress(files);
              response = nextResponse as R;
            }),
        ),
        onError: combine(
          UploadCallbackEvent.OnError,
          actionOptions,
          ({ files: nextFiles, error: nextError }) =>
            update(() => {
              files = mergeFiles(nextFiles);
              progress = calculateProgress(files);
              error = nextError;
            }),
        ),
        onBeforeUploadError: combine(
          UploadCallbackEvent.OnBeforeUploadError,
          actionOptions,
          ({ files: nextFiles, error: nextError }) =>
            update(() => {
              files = mergeFiles(nextFiles);
              progress = calculateProgress(files);
              error = nextError;
              if (
                !files.some(
                  (file) => file.status === UploadFileStatus.Uploading,
                )
              ) {
                status = UploadFileStatus.Error;
                loading = false;
              }
            }),
        ),
        onTask: combine(UploadCallbackEvent.OnTask, actionOptions, () => {}),
      };
    };

    /** 准备批次后执行上传、同步当前错误，并保留底层 Promise 拒绝 */
    const execute = async <T extends UploadExecutionOptions<R, E>, V>(
      actionOptions: T,
      action: (preparedOptions: T) => Promise<V>,
    ) => {
      const preparedOptions = prepare(actionOptions);
      const batchId = activeBatchId;
      const fail = (nextError: unknown) => {
        if (batchId === activeBatchId) {
          const results =
            nextError instanceof UploadAggregateError ? nextError.results : [];
          const canceled =
            files.some((file) => file.status === UploadFileStatus.Canceled) ||
            results.some(
              (result) => result.file.status === UploadFileStatus.Canceled,
            );
          status = canceled
            ? UploadFileStatus.Canceled
            : UploadFileStatus.Error;
          loading = false;
          error = nextError as E | TransportError | Error;
        }
      };
      try {
        const nextResponse = await action(preparedOptions);
        const finish = <T>(nextValue: T) => {
          if (batchId === activeBatchId) {
            status = UploadFileStatus.Success;
            progress = 100;
            loading = false;
            response = nextValue as R | R[];
          }
          return nextValue;
        };
        if ("fetchUpload" in Object(nextResponse)) {
          const deferred = nextResponse as DeferredUploadResult<R, E>;
          const fetchUpload = deferred.fetchUpload;
          let hookUploadPromise: Promise<R | R[]> | undefined;
          deferred.fetchUpload = () =>
            (hookUploadPromise ??= fetchUpload().then(
              (value) => finish(value),
              (nextError) => {
                fail(nextError);
                throw nextError;
              },
            ));
        } else {
          finish(nextResponse);
        }
        return nextResponse;
      } catch (nextError) {
        fail(nextError);
        throw nextError;
      }
    };

    const chooseMedia = (actionOptions: ChooseMediaUploadOptions<R, E> = {}) =>
      execute(actionOptions, (preparedOptions) =>
        runtimeUpload.chooseMedia(preparedOptions),
      );

    const chooseMessageFile = (
      actionOptions: ChooseMessageFileUploadOptions<R, E> = {},
    ) =>
      execute(actionOptions, (preparedOptions) =>
        runtimeUpload.chooseMessageFile(preparedOptions),
      );

    const runUpload = ((actionOptions: UploadActionOptions<R, E>) =>
      execute(actionOptions, (preparedOptions) =>
        runtimeUpload.upload(preparedOptions),
      )) as UseUploadMethod<R, E>;

    return {
      state: {
        get files() {
          return files;
        },
        get status() {
          return status;
        },
        get progress() {
          return progress;
        },
        get loading() {
          return loading;
        },
        get error() {
          return error;
        },
        get response() {
          return response;
        },
      },
      chooseMedia,
      chooseMessageFile,
      upload: runUpload,
      cancel: (taskId) => runtimeUpload.cancel(taskId),
      cancelAll: () => runtimeUpload.cancelAll(),
      reset,
    };
  };
}

export type * from "./types";
