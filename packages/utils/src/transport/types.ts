/** 传输层通用配置 */
export interface TransportConfig {
  /** 是否显示错误提示 */
  isPrompt?: boolean;
  /** 是否显示加载提示 */
  load?: boolean;
  /** 加载提示文本 */
  loadText?: string;
  /** 是否启用工厂配置 */
  isFactory?: boolean;
  /** 超时后是否中止任务 */
  timeoutAbort?: boolean;
}

/** 传输实例初始化选项 */
export interface TransportOptions<C extends TransportConfig = TransportConfig> {
  /** 基础请求地址 */
  baseUrl?: string;
  /** 超时时间 */
  timeout?: number;
  /** 默认请求头 */
  header?: WechatMiniprogram.IAnyObject;
  /** 默认传输配置 */
  config?: C;
}

/** 单次传输调用信息 */
export type TransportInfo<C extends TransportConfig = TransportConfig> = C & {
  /** 请求地址 */
  url: string;
  /** 超时时间 */
  timeout?: number;
  /** 请求头 */
  header?: WechatMiniprogram.IAnyObject;
};

/** 传输错误信息 */
export interface TransportError<R = any> {
  /** 错误信息 */
  errMsg?: string;
  /** 状态码 */
  statusCode?: number;
  /** 原始响应 */
  response?: R;
}

/** 传输派发结果 */
export interface TransportDispatchResult<I = any, R = any> {
  /** 最终请求信息 */
  requestInfo: I;
  /** 原始响应 */
  response: R;
}

/** 请求拦截器 */
export type TransportRequestInterceptor<I> = (requestInfo: I) => I;
/** 响应拦截器 */
export type TransportResponseInterceptor<D, T = any> = (
  dispatchResult: D,
) => Promise<T> | T;
/** 完成拦截器 */
export type TransportEndInterceptor<I> = (requestInfo: I) => void;
/** 错误拦截器 */
export type TransportErrorInterceptor<R = any> = (
  error: TransportError<R>,
) => void;

/** 拦截器注册器 */
export interface InterceptorManager<T extends (...args: any[]) => any> {
  /** 注册拦截器 */
  use: (interceptor: T) => void;
}

/** 传输拦截器集合 */
export interface TransportInterceptors<
  I,
  R,
  D = TransportDispatchResult<I, R>,
> {
  /** 请求拦截器 */
  request: InterceptorManager<TransportRequestInterceptor<I>>;
  /** 响应拦截器 */
  response: InterceptorManager<TransportResponseInterceptor<D, any>>;
  /** 完成拦截器 */
  end: InterceptorManager<TransportEndInterceptor<I>>;
  /** 错误拦截器 */
  error: InterceptorManager<TransportErrorInterceptor<R>>;
}
