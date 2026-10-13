import type { FieldMapping } from "./types";

const DEFAULT_MAPPING: Required<FieldMapping> = {
  code: "code",
  message: "message",
  data: "data",
  records: "records",
  total: "total",
  current: "current",
  size: "size",
  hasMore: "hasMore",
};

/** 响应字段映射器 */
export class ResponseFieldMapper {
  /** 响应字段配置 */
  private readonly mapping: Required<FieldMapping>;

  constructor(mapping: FieldMapping = {}) {
    this.mapping = {
      ...DEFAULT_MAPPING,
      ...mapping,
    };
  }

  /** 获取响应状态码 */
  getCode(response: any): number {
    return Number(response?.[this.mapping.code]) || 0;
  }

  /** 获取响应消息 */
  getMessage(response: any): string {
    return response?.[this.mapping.message] || "";
  }

  /** 获取响应数据 */
  getData<T = any>(response: any): T | null {
    return response?.[this.mapping.data] ?? null;
  }

  /** 获取请求任务 */
  getRequestTask(response: any): WechatMiniprogram.RequestTask | undefined {
    return response?.requestTask;
  }

  /** 获取列表数据 */
  getList<T = any>(response: T): T[] {
    const data = this.getData<any>(response);
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const records = data[this.mapping.records];
    return Array.isArray(records) ? records : [];
  }

  /** 获取总条数 */
  getTotal<T = any>(response: T): number {
    const data = this.getData<T>(response);
    if (!data) return 0;
    const total = data[this.mapping.total as keyof T];
    return Number(total) || 0;
  }

  /** 获取当前页参数名 */
  getCurrentKey(): string {
    return this.mapping.current;
  }

  /** 获取每页大小参数名 */
  getSizeKey(): string {
    return this.mapping.size;
  }

  /** 获取是否还有更多数据 */
  getHasMore(
    response: any,
    current: number,
    size: number,
    total: number,
  ): boolean {
    const data = this.getData<any>(response);
    if (data && typeof data[this.mapping.hasMore] === "boolean") {
      return data[this.mapping.hasMore];
    }
    return current < Math.ceil(total / size);
  }
}
