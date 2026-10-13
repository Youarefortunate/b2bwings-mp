import type { PaginationConfig } from "../pageRequest/types";

/** 微信官方请求配置 */
export type WxReqOpts = WechatMiniprogram.RequestOption;
/** 微信官方请求配置，不包含 success、fail、complete 回调 */
export type WxReqOptsNoFn = Omit<WxReqOpts, "success" | "fail" | "complete">;

/** 后端响应数据 */
export type ResponseData<T = any> = T;

/** 请求返回的 Promise 类型，装饰了底层微信 RequestTask 属性 */
export type RequestPromise<T = any> = Promise<ResponseData<T>> & {
  /** 请求任务 */
  requestTask?: WechatMiniprogram.RequestTask;
};

/** 响应字段映射配置 */
export interface FieldMapping {
  /** 响应状态码字段名 */
  code?: string;
  /** 响应消息字段名 */
  message?: string;
  /** 响应数据字段名 */
  data?: string;
  /** 列表数据字段名 */
  records?: string;
  /** 总条数字段名 */
  total?: string;
  /** 当前页参数名 */
  current?: string;
  /** 每页大小参数名 */
  size?: string;
  /** 是否还有更多数据字段名 */
  hasMore?: string;
}

/** 自定义请求配置（由使用者决定更多的配置项） */
export interface CustomRequestConfig {}

/** 请求配置 */
export interface RequestConfig extends CustomRequestConfig {
  /** 是否自动提示错误 */
  isPrompt?: boolean;
  /** 是否显示加载动画 */
  load?: boolean;
  /** 加载提示文本 */
  loadText?: string;
  /** 是否使用数据工厂 */
  isFactory?: boolean;
  /** 是否超时自动取消 */
  timeoutAbort?: boolean;
  /** 响应字段映射配置 */
  mapping?: FieldMapping;
  /** 分页请求默认配置 */
  pagination?: Partial<Pick<PaginationConfig, "current" | "size">>;
  /** 用于接收 requestTask 的回调 */
  onRequestTask?: (task: WechatMiniprogram.RequestTask) => void;
}

/** 请求选项配置，用于初始化请求类时的配置 */
export interface RequestOptions extends Omit<WxReqOptsNoFn, "url"> {
  /** 基础请求地址 */
  baseUrl?: string;
  /** 请求配置 */
  config?: RequestConfig;
}

/** 正真的请求信息（url、data、method....） */
export type RequestInfo = RequestConfig & WxReqOptsNoFn;

/** 请求调用配置项（包含自定义配置 RequestConfig 和微信原生请求配置，且排除了 url、data */
export type RequestConfigOptions = RequestConfig &
  Omit<WxReqOptsNoFn, "url" | "data">;

export interface RequestError<R = any> extends Pick<
  DispatchResult<R>,
  "response"
> {
  /** 错误信息 */
  errMsg?: string;
  /** 状态码，返回0为自定义的错误状态码 */
  statusCode?: number;
}

/** 请求响应数据 */
export interface DispatchResult<T = any> extends RequestInfo {
  /** 后端响应数据 */
  response: T;
}

/** 请求拦截器 */
export type RequestInterceptor = (requestInfo: RequestInfo) => RequestInfo;

/** 响应拦截器 */
export type ResponseInterceptor<T = any> = (
  dispatchResult: DispatchResult<T>,
) => Promise<T> | T;

/** 请求完成拦截器 */
export type RequestEndInterceptor = (requestInfo: RequestInfo) => void;

/** 请求错误拦截器 */
export type RequestErrorInterceptor<R = any> = (error: RequestError<R>) => void;

/** 拦截器管理器 */
export interface InterceptorManager<T extends (...args: any[]) => any> {
  /** 注册拦截器 */
  use: (interceptor: T) => void;
}

/** 请求实例拦截器 */
export interface RequestInterceptors<R = any> {
  /** 请求前置拦截器 */
  request: InterceptorManager<RequestInterceptor>;
  /** 响应后置拦截器 */
  response: InterceptorManager<ResponseInterceptor<R>>;
  /** 请求完成拦截器 */
  end: InterceptorManager<RequestEndInterceptor>;
  /** 请求错误拦截器 */
  error: InterceptorManager<RequestErrorInterceptor<R>>;
}
