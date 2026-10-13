import { UploadFileStatus } from "./enums";
import type { UploadFile, UploadInfo } from "./types";

/** 并发数默认值 */
export const DEFAULT_CONCURRENCY = 3;
/** 最大并发数 */
export const MAX_CONCURRENCY = 10;

/**
 * 归一化并发数：截断取整后收敛到 [1, 10]，非有限数字回退默认值 3
 * @param concurrency 原始并发数
 */
export function normalizeConcurrency(concurrency: number) {
  return Number.isFinite(concurrency)
    ? Math.max(1, Math.min(MAX_CONCURRENCY, Math.trunc(concurrency)))
    : DEFAULT_CONCURRENCY;
}

type ChooseMediaFile = WechatMiniprogram.MediaFile;
type ChooseMessageFile = WechatMiniprogram.ChooseFile;

/**
 * 生成上传任务 ID
 */
export function getUploadTaskId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * 解析文件大小限制，number 按 MB 处理
 * @param size 文件大小限制
 */
export function parseMaxSize(size: number | string = 3) {
  if (typeof size === "number") {
    return size * 1024 * 1024;
  }

  const match = size.match(/^(\d+)([MmKkBb])$/);
  if (!match) {
    return 3 * 1024 * 1024;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "k") return value * 1024;
  if (unit === "b") return value;
  return value * 1024 * 1024;
}

/**
 * 解析允许上传的文件扩展名
 * @param exts 文件扩展名列表
 */
export function parseFileExts(exts: string[] = []) {
  return [...new Set(exts.map((ext) => ext.replace(/^\./, "").toLowerCase()))];
}

/**
 * 获取文件扩展名
 * @param file 上传文件
 */
export function getFileExt(file: UploadFile) {
  return (file.name || file.path).split(".").pop()?.toLowerCase() || "";
}

/**
 * 创建标准上传文件对象
 * @param file 文件信息
 */
export function createUploadFile(
  file: Partial<UploadFile> & { path: string; size: number },
): UploadFile {
  return {
    ...file,
    taskId: file.taskId ?? getUploadTaskId(),
    status: file.status ?? UploadFileStatus.Ready,
    percent: file.percent ?? 0,
  };
}

/**
 * 将 wx.chooseMedia 返回文件转为标准上传文件
 * @param file wx.chooseMedia 返回的文件
 */
export function createUploadFileFromMedia(file: ChooseMediaFile): UploadFile {
  return createUploadFile({
    path: file.tempFilePath,
    size: file.size,
    type: file.fileType,
    duration: file.duration,
    height: file.height,
    width: file.width,
    thumbTempFilePath: file.thumbTempFilePath,
  });
}

/**
 * 将 wx.chooseMessageFile 返回文件转为标准上传文件
 * @param file wx.chooseMessageFile 返回的文件
 */
export function createUploadFileFromMessage(
  file: ChooseMessageFile,
): UploadFile {
  return createUploadFile({
    path: file.path,
    name: file.name,
    size: file.size,
    type: file.type,
    time: file.time,
  });
}

/**
 * 创建微信上传参数
 * @param uploadInfo 上传调用信息
 */
export function createWxUploadOption<R, E>(
  uploadInfo: UploadInfo<R, E>,
): WechatMiniprogram.UploadFileOption {
  const header = { ...(uploadInfo.header ?? {}) };
  Object.keys(header).forEach((key) => {
    if (key.toLowerCase() === "content-type") {
      delete header[key];
    }
  });

  const baseOption = {
    url: uploadInfo.url,
    timeout: uploadInfo.timeout,
    header,
    formData: uploadInfo.data,
    success: () => {},
    fail: () => {},
  };

  return {
    ...baseOption,
    filePath: uploadInfo.files[0].path,
    name: uploadInfo.name ?? "file",
  };
}
