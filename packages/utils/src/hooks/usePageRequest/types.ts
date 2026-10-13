import type {
  RequestInfo,
  RequestError,
  RequestPromise,
  RequestConfigOptions,
} from "../../request/types";
import type {
  PaginationConfig,
  ParamsOrFn,
  BeforeFetchCallback,
  AfterFetchCallback,
} from "../../pageRequest/types";
import type { UsePageRequestConfig } from "../shared/requestArgs/index";

/** 分页请求返回的结果结构 */
export interface PageRequestResult<T = any> {
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 列表数据 */
  record: T[];
  /** 总数据量 */
  total: number;
  /** 错误详情 */
  error: RequestError | Error | null;
  /** 是否正在加载 */
  loading: boolean;
}

/** 分页请求状态（响应式只读属性） */
export type PageRequestState<T = any> = Readonly<PageRequestResult<T>> &
  Readonly<{
    /** 是否还有更多数据 */
    hasMore: boolean;
  }>;

/** usePageRequest 返回的对象接口 */
export interface UsePageRequestReturn<T = any> {
  /** 当前请求的状态（响应式只读属性） */
  state: PageRequestState<T>;
  /**
   * 发起分页请求
   * @param extraParams 可选的额外参数，可以是对象或返回对象的函数
   */
  fetch: (extraParams?: ParamsOrFn) => RequestPromise<PageRequestResult<T>>;
  /** 刷新数据（重置到第一页） */
  refresh: (extraParams?: ParamsOrFn) => RequestPromise<PageRequestResult<T>>;
  /** 请求下一页数据 */
  next: (extraParams?: ParamsOrFn) => RequestPromise<PageRequestResult<T>>;
  /** 加载更多数据 */
  loadMore: () => RequestPromise<PageRequestResult<T>>;
  /** 重置分页状态和列表数据 */
  reset: () => void;
  /** 取消当前正在进行的请求 */
  cancel: () => void;
  /** 分页配置 */
  pagination: PaginationConfig;
  /**
   * 请求发起前的钩子
   * @param callback 接收合并后参数的回调函数
   */
  beforeFetch: (callback: BeforeFetchCallback) => void;
  /**
   * 请求完成后的钩子
   * @param callback 接收响应数据的回调函数
   */
  afterFetch: (callback: AfterFetchCallback) => void;
}

/**
 * usePageRequest Hook 类型定义
 * @param url 接口地址
 * @param params 初始参数
 * @param options 配置项
 * @param pagination 分页配置
 */
export interface UsePageRequest {
  <T = any>(config: UsePageRequestConfig): UsePageRequestReturn<T>;
  <T = any>(
    url: RequestInfo["url"],
    params?: ParamsOrFn,
    options?: RequestConfigOptions,
    pagination?: Partial<PaginationConfig>,
  ): UsePageRequestReturn<T>;
}
