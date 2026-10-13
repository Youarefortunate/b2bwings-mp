import type {
  RequestInfo,
  RequestError,
  RequestPromise,
  RequestConfigOptions,
} from "../../request/types";
import type { UseRequestConfig } from "../shared/requestArgs/index";

/** 请求返回状态 */
export type RequestState<T = any> = Readonly<RequestResult<T>>;

/** 请求方法返回的 Promise 结果结构 */
export interface RequestResult<T = any> {
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T | null;
  /** 错误详情 */
  error: RequestError | Error | null;
  /** 是否正在加载 */
  loading: boolean;
}

/** beforeFetch 回调函数类型 */
export type BeforeFetchCallback = (config: RequestInfo) => void;

/** useRequest 返回的对象接口 */
export interface UseRequestReturn<T = any> {
  /** 当前请求的状态（响应式只读属性） */
  state: RequestState<T>;
  /**
   * 发起请求的方法
   * @param extraParams 可选的额外参数，可以是对象或返回对象的函数
   */
  fetch: (
    extraParams?: RequestInfo["data"] | (() => RequestInfo["data"]),
  ) => RequestPromise<RequestResult<T>>;
  /** 取消当前正在进行的请求 */
  cancel: () => void;
  /**
   * 请求发起前的钩子，用于修改 config
   * @param callback 接收 config 并可进行修改的回调函数
   */
  beforeFetch: (callback: BeforeFetchCallback) => void;
}

/**
 * 自定义请求 Hook 类型定义
 * @param url 接口地址
 * @param params 初始参数
 * @param options 配置项
 */
export interface UseRequest {
  <T = any>(config: UseRequestConfig): UseRequestReturn<T>;
  <T = any>(
    url: RequestInfo["url"],
    params?: RequestInfo["data"] | (() => RequestInfo["data"]),
    options?: RequestConfigOptions,
  ): UseRequestReturn<T>;
}
