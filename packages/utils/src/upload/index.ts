import { BaseTransport } from "../transport/index";
import type { TransportError } from "../transport/types";
import type {
  ChooseMediaUploadOptions,
  ChooseMessageFileUploadOptions,
  UploadActionOptions,
  UploadBatchController,
  UploadConfig,
  UploadFile,
  UploadInfo,
  UploadOptions,
  UploadRejectedResult,
  UploadResult,
  UploadResultForOptions,
  UploadSettledResult,
} from "./types";
import { UploadFileStatus, UploadMode, UploadSettledStatus } from "./enums";
import {
  createUploadFile,
  createUploadFileFromMedia,
  createUploadFileFromMessage,
  createWxUploadOption,
  getFileExt,
  normalizeConcurrency,
  parseFileExts,
  parseMaxSize,
} from "./utils";

/** 多文件上传聚合错误 */
export class UploadAggregateError<R = unknown, E = unknown> extends Error {
  /** 所有失败文件的原始错误 */
  readonly errors: E[];
  /** 按文件原始顺序排列的上传结果 */
  readonly results: readonly UploadSettledResult<R, E>[];

  constructor(
    errors: readonly E[],
    results: readonly UploadSettledResult<R, E>[],
  ) {
    super("部分文件上传失败");
    this.name = "UploadAggregateError";
    this.errors = [...errors];
    this.results = results;
  }
}

/** 微信文件选择与上传管理器 */
export class Upload<R = unknown, E = unknown> extends BaseTransport<
  UploadInfo<R, E>,
  unknown,
  UploadConfig
> {
  /** 默认上传路径 */
  defaultUploadUrl = "";
  /** 默认文件字段名 */
  name = "file";
  /** 默认文件大小限制 */
  maxSize: number | string = 3;
  /** 允许上传的文件扩展名 */
  allowedExts: string[] = ["jpg", "jpeg", "png"];
  /** 是否立即上传 */
  autoUpload = true;
  /** 多文件上传调度模式 */
  mode = UploadMode.Pool;
  /** pool 模式并发数 */
  concurrency = 3;
  /** 上传任务池 */
  taskMap = new Map<string, WechatMiniprogram.UploadTask>();
  /** 当前实例已预留且尚未结算的任务 ID */
  private activeTaskIds = new Set<string>();
  /** 活动任务的内部取消结算器 */
  private activeTaskCancels = new Map<string, () => void>();
  /** 正在执行的上传批次控制器 */
  private activeBatchControllers = new Set<UploadBatchController>();

  constructor(options: UploadOptions = {}) {
    super(options);
    this.defaultUploadUrl = options.defaultUploadUrl ?? "";
    this.name = options.name ?? "file";
    this.maxSize = options.maxSize ?? 3;
    this.allowedExts = options.allowedExts ?? ["jpg", "jpeg", "png"];
    this.autoUpload = options.autoUpload ?? true;
    this.mode = options.mode ?? UploadMode.Pool;
    this.concurrency = normalizeConcurrency(options.concurrency ?? 3);
  }

  /** 创建独立上传实例 */
  static create<R = unknown, E = unknown>(options: UploadOptions = {}) {
    return new Upload<R, E>(options);
  }

  /** 选择媒体文件并按配置上传 */
  chooseMedia(
    options: ChooseMediaUploadOptions<R, E> = {},
  ): UploadResult<R, E> {
    const {
      count = 9,
      mediaType = ["image", "video"],
      sourceType = ["album", "camera"],
      maxDuration = 10,
      sizeType = ["original", "compressed"],
      camera = "back",
      ...uploadOptions
    } = options;
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count,
        mediaType,
        sourceType,
        maxDuration,
        sizeType,
        camera,
        success: (res) => {
          resolve(
            this.upload({
              ...uploadOptions,
              files: res.tempFiles.map(createUploadFileFromMedia),
            }),
          );
        },
        fail: reject,
      });
    });
  }

  /** 选择聊天文件并按配置上传 */
  chooseMessageFile(
    options: ChooseMessageFileUploadOptions<R, E> = {},
  ): UploadResult<R, E> {
    const { count = 9, type = "all", extension, ...uploadOptions } = options;
    return new Promise((resolve, reject) => {
      wx.chooseMessageFile({
        count,
        type,
        extension,
        success: (res) => {
          resolve(
            this.upload({
              ...uploadOptions,
              allowedExts: uploadOptions.allowedExts ?? extension,
              files: res.tempFiles.map(createUploadFileFromMessage),
            }),
          );
        },
        fail: reject,
      });
    });
  }

  /** 根据自动上传配置执行或延迟上传 */
  async upload<
    const F extends readonly UploadFile[],
    const A extends boolean | undefined = undefined,
  >(
    options: Omit<UploadActionOptions<R, E, F>, "autoUpload"> & {
      autoUpload?: A;
    },
  ): Promise<
    UploadResultForOptions<R, E, UploadActionOptions<R, E, F>["files"], A>
  > {
    const uploadInfo = this.createUploadInfo({
      ...options,
      files: [...options.files],
    });
    this.validateFiles(uploadInfo);

    this.notify(
      uploadInfo.onSelectComplete,
      uploadInfo.files.map((file) => ({ ...file })),
    );

    const autoUpload = uploadInfo.autoUpload ?? this.autoUpload;
    if (!autoUpload) {
      let uploadPromise: Promise<R | R[]> | undefined;
      return {
        files: uploadInfo.files,
        uploadInfo,
        fetchUpload: () => (uploadPromise ??= this.executeUpload(uploadInfo)),
      } as UploadResultForOptions<
        R,
        E,
        UploadActionOptions<R, E, F>["files"],
        A
      >;
    }

    return this.executeUpload(uploadInfo) as Promise<
      UploadResultForOptions<R, E, UploadActionOptions<R, E, F>["files"], A>
    >;
  }

  /** 取消指定上传任务，包括当前实例尚未调度的任务 */
  cancel(taskId: string) {
    const cancelTask = this.activeTaskCancels.get(taskId);
    if (cancelTask) {
      cancelTask();
      return;
    }
    this.activeBatchControllers.forEach((controller) =>
      controller.cancelPending(taskId),
    );
  }

  /** 取消当前实例全部上传任务并阻止批次继续调度 */
  cancelAll() {
    this.activeBatchControllers.forEach((controller) =>
      controller.cancelAllPending(),
    );
    new Set(this.activeTaskCancels.values()).forEach((cancelTask) =>
      cancelTask(),
    );
  }

  private validateFiles(uploadInfo: UploadInfo<R, E>) {
    if (!uploadInfo.files.length) {
      throw {
        statusCode: 0,
        errMsg: "上传文件不能为空",
      } as TransportError;
    }
  }

  /** 原子预留批次任务 ID，避免活动任务互相覆盖 */
  private reserveTaskIds(uploadInfo: UploadInfo<R, E>) {
    const taskIds = uploadInfo.files.map((file) => file.taskId);
    const seen = new Set<string>();
    const duplicateTaskId = taskIds.find((taskId) => {
      if (seen.has(taskId) || this.activeTaskIds.has(taskId)) return true;
      seen.add(taskId);
      return false;
    });
    if (duplicateTaskId) {
      throw {
        statusCode: 0,
        errMsg: `上传任务 ID 不能重复：${duplicateTaskId}`,
      } as TransportError;
    }
    taskIds.forEach((taskId) => this.activeTaskIds.add(taskId));
    return taskIds;
  }

  /** 执行上传生命周期并在批次结算后释放任务 ID */
  private async executeUpload(uploadInfo: UploadInfo<R, E>) {
    const taskIds = this.reserveTaskIds(uploadInfo);
    try {
      return await this.executeUploadBatch(uploadInfo);
    } finally {
      taskIds.forEach((taskId) => this.activeTaskIds.delete(taskId));
    }
  }

  /** 执行上传生命周期并同步文件最终状态 */
  private async executeUploadBatch(uploadInfo: UploadInfo<R, E>) {
    const results = new Array<UploadSettledResult<R, E>>(
      uploadInfo.files.length,
    );
    let nextIndex = 0;
    // 已派发且已结算、等待 worker 落位的文件索引：拦截器窗口内取消不吞掉真实结果
    const pendingPlacement = new Set<number>();
    const rejectFile = (
      index: number,
      error: E,
      status: UploadFileStatus.Error | UploadFileStatus.Canceled,
      notifyError = true,
    ) => {
      if (results[index]) return;
      const fileInfo = { ...uploadInfo, files: [uploadInfo.files[index]] };
      fileInfo.files[0].status = status;
      // 先落结算占位再通知，防止状态回调重入取消导致重复结算与递归
      results[index] = {
        file: { ...fileInfo.files[0] },
        status: UploadSettledStatus.Rejected,
        error,
      };
      this.emitFilesStatus(fileInfo, uploadInfo);
      if (notifyError) {
        this.notify(uploadInfo.onError, {
          files: fileInfo.files.map((file) => ({ ...file })),
          error,
        });
      }
    };
    const cancelPending = (taskId: string) => {
      uploadInfo.files.forEach((file, index) => {
        if (
          file.taskId === taskId &&
          !results[index] &&
          !pendingPlacement.has(index) &&
          !this.taskMap.has(taskId)
        ) {
          rejectFile(
            index,
            { errMsg: "uploadFile:fail abort" } as E,
            UploadFileStatus.Canceled,
          );
        }
      });
    };
    let resolveCanceled!: () => void;
    const canceled = new Promise<void>((resolve) => {
      resolveCanceled = resolve;
    });
    const controller: UploadBatchController = {
      cancelPending,
      cancelAllPending: () => {
        uploadInfo.files.forEach((file) => cancelPending(file.taskId));
        resolveCanceled();
      },
    };
    this.activeBatchControllers.add(controller);
    try {
      await Promise.race([
        this.runBeforeUpload(uploadInfo, (index) => Boolean(results[index])),
        canceled,
      ]);
    } catch (error) {
      this.activeBatchControllers.delete(controller);
      throw error;
    }
    const worker = async () => {
      while (nextIndex < uploadInfo.files.length) {
        const index = nextIndex++;
        if (results[index]) continue;
        const fileInfo = { ...uploadInfo, files: [uploadInfo.files[index]] };
        try {
          this.validateFile(fileInfo, uploadInfo);
        } catch (error) {
          // 校验通知期间可能被重入取消结算，保持首次结算不被覆盖
          if (results[index]) continue;
          results[index] = {
            file: { ...fileInfo.files[0] },
            status: UploadSettledStatus.Rejected,
            error: error as E,
          };
          continue;
        }
        this.setFilesStatus(fileInfo, UploadFileStatus.Uploading, uploadInfo);
        if (results[index]) continue;
        try {
          const response = await this.runLifecycle<R>(fileInfo, (finalInfo) => {
            const settled = results[index];
            if (settled?.status === UploadSettledStatus.Rejected) {
              return Promise.reject(settled.error);
            }
            return this.dispatchUpload(finalInfo, uploadInfo).finally(() => {
              pendingPlacement.add(index);
            });
          });
          if (results[index]) continue;
          fileInfo.files[0].status = UploadFileStatus.Success;
          fileInfo.files[0].percent = 100;
          // 先落结算占位再通知，防止成功状态回调重入取消导致结算覆盖
          results[index] = {
            file: { ...fileInfo.files[0] },
            status: UploadSettledStatus.Fulfilled,
            response,
          };
          this.emitFilesStatus(fileInfo, uploadInfo);
          this.notify(uploadInfo.onSuccess, {
            files: fileInfo.files.map((file) => ({ ...file })),
            response,
          });
        } catch (error) {
          if (results[index]) continue;
          const canceled =
            fileInfo.files[0].status === UploadFileStatus.Canceled;
          rejectFile(
            index,
            error as E,
            canceled ? UploadFileStatus.Canceled : UploadFileStatus.Error,
          );
        }
      }
    };
    const workerCount =
      uploadInfo.mode === UploadMode.Pool
        ? Math.min(
            normalizeConcurrency(uploadInfo.concurrency ?? 3),
            uploadInfo.files.length,
          )
        : 1;

    try {
      await Promise.all(Array.from({ length: workerCount }, worker));
    } finally {
      this.activeBatchControllers.delete(controller);
    }
    const settledResults: UploadSettledResult<R, E>[] = uploadInfo.files.map(
      (file, index) => {
        if (results[index]) return results[index];
        const error = {
          statusCode: 0,
          errMsg: "上传任务未结算",
        } as E;
        file.status = UploadFileStatus.Error;
        return {
          file: { ...file },
          status: UploadSettledStatus.Rejected,
          error,
        };
      },
    );
    const errors = settledResults
      .filter(
        (result): result is UploadRejectedResult<E> =>
          result.status === UploadSettledStatus.Rejected,
      )
      .map((result) => result.error);
    if (errors.length) {
      if (uploadInfo.files.length === 1) {
        throw errors[0];
      }
      throw new UploadAggregateError<R, E>(errors, settledResults);
    }
    const responses = settledResults.map((result) => {
      if (result.status !== UploadSettledStatus.Fulfilled) {
        throw new Error("上传结果状态异常");
      }
      return result.response;
    });
    return uploadInfo.files.length === 1 ? responses[0] : responses;
  }

  private createUploadInfo(
    options: Partial<UploadInfo<R, E>>,
  ): UploadInfo<R, E> {
    return {
      ...options,
      url: options.url || this.defaultUploadUrl,
      timeout: options.timeout ?? this.timeout,
      header: options.header,
      files: (options.files ?? []).map(createUploadFile),
      name: options.name ?? this.name,
      data: options.data,
      maxSize: options.maxSize ?? this.maxSize,
      allowedExts: options.allowedExts ?? this.allowedExts,
      autoUpload: options.autoUpload ?? this.autoUpload,
      mode: options.mode ?? this.mode,
      concurrency: normalizeConcurrency(
        options.concurrency ?? this.concurrency,
      ),
      beforeUpload: options.beforeUpload,
      onSelectComplete: options.onSelectComplete,
      onStatusChange: options.onStatusChange,
      onProgress: options.onProgress,
      onTask: options.onTask,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onBeforeUploadError: options.onBeforeUploadError,
    };
  }

  private async runBeforeUpload(
    uploadInfo: UploadInfo<R, E>,
    isSettled?: (index: number) => boolean,
  ) {
    if (!uploadInfo.beforeUpload) return;
    try {
      await uploadInfo.beforeUpload(uploadInfo);
    } catch (error) {
      // 已结算（如已被取消）的文件保持最终状态，仅对未结算文件生效
      const pendingFiles = uploadInfo.files.filter(
        (_file, index) => !isSettled?.(index),
      );
      if (pendingFiles.length) {
        this.setFilesStatus(
          { ...uploadInfo, files: pendingFiles },
          UploadFileStatus.Error,
        );
        this.notify(uploadInfo.onBeforeUploadError, {
          files: pendingFiles.map((file) => ({ ...file })),
          error: error as E,
        });
      }
      throw error;
    }
  }

  /** 按文件执行默认大小与扩展名校验 */
  private validateFile(
    fileInfo: UploadInfo<R, E>,
    batchInfo: UploadInfo<R, E>,
  ) {
    if (batchInfo.beforeUpload) return;
    try {
      const file = fileInfo.files[0];
      const maxSize = parseMaxSize(fileInfo.maxSize);
      if (file.size > maxSize) {
        throw {
          statusCode: 0,
          errMsg: `最大上传${(maxSize / 1024 / 1024).toFixed(2)}MB限制`,
        };
      }
      const allowedExts = parseFileExts(fileInfo.allowedExts);
      const ext = getFileExt(file);
      if (allowedExts.length && !allowedExts.includes(ext)) {
        throw {
          statusCode: 0,
          errMsg: `仅允许${allowedExts.join("、")}格式文件`,
        };
      }
    } catch (error) {
      this.setFilesStatus(fileInfo, UploadFileStatus.Error, batchInfo);
      this.notify(batchInfo.onBeforeUploadError, {
        files: fileInfo.files.map((file) => ({ ...file })),
        error: error as E,
      });
      throw error;
    }
  }

  /** 执行通知型用户回调并隔离其异常 */
  private notify<T>(callback: ((payload: T) => void) | undefined, payload: T) {
    try {
      callback?.(payload);
    } catch {
      // 隔离通知型用户回调异常，不影响上传主流程
    }
  }

  /** 创建并登记底层上传任务，集中转发进度、取消和清理状态 */
  private dispatchUpload(uploadInfo: UploadInfo<R, E>, batchInfo = uploadInfo) {
    return new Promise<R>((resolve, reject) => {
      const option = createWxUploadOption(uploadInfo);
      let uploadTask: WechatMiniprogram.UploadTask | undefined;
      let settled = false;
      let settledSynchronously = false;
      let uploadFileReturned = false;
      let cancelTask: (() => void) | undefined;
      const cleanupTask = () => {
        uploadInfo.files.forEach((file) => {
          if (uploadTask && this.taskMap.get(file.taskId) === uploadTask) {
            this.taskMap.delete(file.taskId);
          }
          if (
            cancelTask &&
            this.activeTaskCancels.get(file.taskId) === cancelTask
          ) {
            this.activeTaskCancels.delete(file.taskId);
          }
        });
      };
      const rejectOnce = (error: unknown, canceled = false) => {
        if (settled) return;
        settled = true;
        if (!uploadFileReturned) settledSynchronously = true;
        if (canceled) {
          this.setFilesStatus(uploadInfo, UploadFileStatus.Canceled, batchInfo);
        }
        cleanupTask();
        reject(error);
      };
      uploadTask = wx.uploadFile({
        ...option,
        success: (response) => {
          if (settled) return;
          settled = true;
          if (!uploadFileReturned) settledSynchronously = true;
          let data: unknown = response.data;
          try {
            data = JSON.parse(String(response.data));
          } catch {
            data = response.data;
          }
          cleanupTask();
          resolve(data as R);
        },
        fail: (error) => {
          rejectOnce(error, error.errMsg?.includes("fail abort"));
        },
        complete: () => {
          rejectOnce({
            errMsg: "uploadFile:fail complete without success or fail",
          });
        },
      } as WechatMiniprogram.UploadFileOption);
      uploadFileReturned = true;

      if (settledSynchronously) return;
      if (
        !uploadTask ||
        typeof uploadTask.abort !== "function" ||
        typeof uploadTask.onProgressUpdate !== "function"
      ) {
        settled = true;
        reject({ errMsg: "uploadFile:fail invalid UploadTask" });
        return;
      }
      const activeTask = uploadTask;
      cancelTask = () => {
        try {
          activeTask.abort();
        } catch {
          // abort 失败仍由内部结算器完成取消
        }
        rejectOnce({ errMsg: "uploadFile:fail abort" }, true);
      };
      uploadInfo.files.forEach((file) => {
        this.taskMap.set(file.taskId, activeTask);
        this.activeTaskCancels.set(file.taskId, cancelTask!);
      });
      this.notify(uploadInfo.onTask, activeTask);
      try {
        activeTask.onProgressUpdate((progress) => {
          if (settled) return;
          uploadInfo.files.forEach((file) => {
            file.percent = progress.progress;
          });
          this.notify(uploadInfo.onProgress, {
            ...progress,
            files: batchInfo.files.map((file) => ({ ...file })),
          });
          this.emitFilesStatus(uploadInfo, batchInfo);
        });
      } catch (error) {
        cleanupTask();
        try {
          activeTask.abort();
        } catch {
          // 监听注册失败时仅最佳努力中断底层任务
        }
        rejectOnce(error);
      }
    });
  }

  /** 更新批次文件状态并发送状态通知 */
  private setFilesStatus(
    uploadInfo: UploadInfo<R, E>,
    status: UploadFileStatus,
    batchInfo = uploadInfo,
  ) {
    uploadInfo.files.forEach((file) => {
      file.status = status;
      if (status === UploadFileStatus.Uploading) {
        file.percent = 0;
      } else if (status === UploadFileStatus.Success) {
        file.percent = 100;
      }
    });
    this.emitFilesStatus(uploadInfo, batchInfo);
  }

  /** 按文件发送当前批次状态快照 */
  private emitFilesStatus(
    uploadInfo: UploadInfo<R, E>,
    batchInfo = uploadInfo,
  ) {
    uploadInfo.files.forEach((file) => {
      this.notify(uploadInfo.onStatusChange, {
        taskId: file.taskId,
        status: file.status ?? UploadFileStatus.Ready,
        file: { ...file },
        files: batchInfo.files.map((item) => ({ ...item })),
      });
    });
  }
}

export default Upload;
export { UploadFileStatus, UploadMode } from "./enums";
export type * from "./types";
