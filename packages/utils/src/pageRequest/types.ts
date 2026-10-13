import type Request from "../request/index";
import type { RequestInfo, RequestConfigOptions } from "../request/types";

/** 参数或返回参数的函数 */
export type ParamsOrFn = RequestInfo["data"] | (() => RequestInfo["data"]);

/** 分页变更回调 */
export type PaginationOnChange = (page: number) => void;

/** 分页大小变更回调 */
export type PaginationOnShowSizeChange = (
  current: number,
  size: number,
) => void;

/** 分页配置 */
export interface PaginationConfig {
  /** 当前页码 */
  current: number;
  /** 每页条目数 */
  size: number;
  /** 总数据量 */
  total: number;
  /** 是否还有更多数据 */
  hasMore?: boolean;
  /** 页码变更回调 */
  onChange: PaginationOnChange | null;
  /** 每页大小变更回调 */
  onShowSizeChange: PaginationOnShowSizeChange | null;
}

/** PageRequest 构造参数 */
export interface PageRequestConfig {
  /** 请求地址 */
  url: RequestInfo["url"];
  /** 请求参数（对象或返回对象的函数） */
  params?: ParamsOrFn;
  /** 请求选项 */
  options?: RequestConfigOptions;
  /** 分页配置 */
  pagination?: Partial<PaginationConfig>;
  /** 请求实例 */
  request: Request;
}

/** beforeFetch 回调函数类型 */
export type BeforeFetchCallback = (params: RequestInfo["data"]) => void;

/** afterFetch 回调函数类型 */
export type AfterFetchCallback<T = any> = (response: T) => void;
