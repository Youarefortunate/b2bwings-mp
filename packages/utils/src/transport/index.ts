import type {
  TransportConfig,
  TransportDispatchResult,
  TransportEndInterceptor,
  TransportError,
  TransportErrorInterceptor,
  TransportInfo,
  TransportInterceptors,
  TransportOptions,
  TransportRequestInterceptor,
  TransportResponseInterceptor,
} from "./types";

/** 提供配置合并与拦截器生命周期的传输基类 */
export class BaseTransport<
  I extends TransportInfo = TransportInfo,
  R = any,
  C extends TransportConfig = TransportConfig,
  D = TransportDispatchResult<I, R>,
> {
  /** 基础请求地址 */
  baseUrl = "";
  /** 超时时间 */
  timeout = 6000;
  /** 默认请求头 */
  header: WechatMiniprogram.IAnyObject = {};
  /** 默认配置 */
  config: C = {} as C;

  /** 请求拦截器 */
  #requestInterceptor: TransportRequestInterceptor<I> = (requestInfo) =>
    requestInfo;
  /** 响应拦截器 */
  #responseInterceptor: TransportResponseInterceptor<D, any> = ((
    dispatchResult: any,
  ) => dispatchResult.response) as TransportResponseInterceptor<D, any>;
  /** 请求完成拦截器 */
  #endInterceptor: TransportEndInterceptor<I> = () => {};
  /** 请求错误拦截器 */
  #errorInterceptor: TransportErrorInterceptor<R> = (error) => {
    throw error;
  };

  /** 拦截器 */
  interceptors: TransportInterceptors<I, R, D> = {
    request: {
      use: (interceptor) => {
        this.#requestInterceptor = interceptor;
      },
    },
    response: {
      use: (interceptor) => {
        this.#responseInterceptor = interceptor;
      },
    },
    end: {
      use: (interceptor) => {
        this.#endInterceptor = interceptor;
      },
    },
    error: {
      use: (interceptor) => {
        this.#errorInterceptor = interceptor;
      },
    },
  };

  constructor(options: TransportOptions<C> = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.timeout = options.timeout ?? 6000;
    this.header = options.header ?? {};
    this.config = (options.config ?? {}) as C;
  }

  /**
   * 合并基础请求配置与单次请求选项
   * @param requestInfo 当前单次请求传入的选项
   * @returns 合并及补齐后的完整请求配置
   */
  protected mergeBaseConfig(requestInfo: I): I {
    const urlType = /^(http|https):\/\//.test(requestInfo.url);
    return {
      timeout: this.timeout,
      ...this.config,
      ...requestInfo,
      url: urlType ? requestInfo.url : this.baseUrl + requestInfo.url,
      header: Object.assign({}, this.header, requestInfo.header ?? {}),
    } as I;
  }

  /**
   * 创建用于响应拦截器入参的派发结果对象
   * @param requestInfo 发起请求时的完整配置信息
   * @param response 底层派发器返回的原始响应结果
   * @returns 供响应拦截器消费的结构体
   */
  protected createDispatchResult(requestInfo: I, response: R): D {
    return { requestInfo, response } as D;
  }

  /**
   * 处理请求成功响应，并流转至响应拦截器
   * @param requestInfo 发起请求时的完整配置信息
   * @param response 原始响应结果
   * @returns 响应拦截器过滤后的最终处理结果
   */
  protected handleResponse(requestInfo: I, response: R) {
    return this.#responseInterceptor(
      this.createDispatchResult(requestInfo, response),
    );
  }

  /**
   * 核心生命周期调度器，顺序执行 请求拦截 -> 发起派发 -> 响应拦截/错误拦截 -> 请求完成
   * @param requestInfo 单次请求入参
   * @param dispatch 底层真实的请求派发执行器
   * @returns 拦截链处理完毕后的最终 Promise 结果
   */
  protected async runLifecycle<T = R>(
    requestInfo: I,
    dispatch: (requestInfo: I) => Promise<R>,
  ): Promise<T> {
    let finalInfo = this.mergeBaseConfig(requestInfo);
    let runStart = false;

    try {
      const requestStart = this.#requestInterceptor(finalInfo);
      if (typeof requestStart === "object" && requestStart !== null) {
        finalInfo = requestStart;
      } else {
        throw {
          errMsg: "【request】请求开始拦截器未通过",
          statusCode: 0,
        };
      }
      runStart = true;
      const response = await dispatch(finalInfo);
      return await this.handleResponse(finalInfo, response);
    } catch (error) {
      this.#errorInterceptor(error as TransportError<R>);
      return Promise.reject(error);
    } finally {
      if (runStart) {
        try {
          this.#endInterceptor(finalInfo);
        } catch {
          // 隔离 end 拦截器异常，不覆盖已成功结果或原始错误
        }
      }
    }
  }
}

export type * from "./types";
