import { BaseTransport } from "../transport/index";
import { dispatchRequest, mergeConfig } from "./utils";
import type {
  DispatchResult,
  RequestConfig,
  RequestConfigOptions,
  RequestInfo,
  RequestOptions,
  RequestPromise,
} from "./types";

export class Request<R = any> extends BaseTransport<
  RequestInfo,
  R,
  RequestConfig,
  DispatchResult<R>
> {
  constructor(options: RequestOptions = {} as RequestOptions) {
    super({
      ...options,
      config: {
        // 是否自动提示消息
        isPrompt: true,
        // 是否需要请求加载loading
        load: true,
        // 加载文本
        loadText: "加载中",
        // 是否用自定义数据处理方法
        isFactory: true,
        // 超是否时自动取消
        timeoutAbort: true,
        ...options.config,
      },
    });
  }

  static create<R = any>(options: RequestOptions = {} as RequestOptions) {
    return new Request<R>(options);
  }

  protected mergeBaseConfig(requestInfo: RequestInfo): RequestInfo {
    return mergeConfig(this, requestInfo);
  }

  protected createDispatchResult(
    requestInfo: RequestInfo,
    response: R,
  ): DispatchResult<R> {
    return {
      ...requestInfo,
      response,
    } as DispatchResult<R>;
  }

  protected handleResponse(requestInfo: RequestInfo, response: R) {
    return requestInfo.isFactory === false
      ? response
      : super.handleResponse(requestInfo, response);
  }

  /** 接口请求方法 */
  request<T = R>(_requestInfo: RequestInfo): RequestPromise<T> {
    let requestTask: WechatMiniprogram.RequestTask | undefined;
    const rawResponse = _requestInfo.isFactory === false;
    if (!_requestInfo.url) {
      return Promise.reject({
        errMsg: "【request】缺失数据url",
        statusCode: 0,
      }) as RequestPromise<T>;
    }

    const promise = this.runLifecycle<T>(_requestInfo, (requestInfo) => {
      const dispatchPromise = dispatchRequest<T>(requestInfo, rawResponse);
      requestTask = dispatchPromise.requestTask;
      return dispatchPromise as unknown as Promise<R>;
    }) as RequestPromise<T>;

    promise.requestTask = requestTask;
    return promise;
  }

  /**
   * post请求
   * @param url 请求url
   * @param data 携带参数
   * @param options 请求配置
   */
  post<T = R>(
    url: RequestInfo["url"] = "",
    data: RequestInfo["data"] = {},
    options: RequestConfigOptions = {},
  ) {
    return this.request<T>({
      method: "POST",
      data,
      url,
      ...options,
    } as RequestInfo);
  }

  /**
   * get请求
   * @param url 请求url
   * @param data 携带参数
   * @param options 请求配置
   */
  get<T = R>(
    url: RequestInfo["url"] = "",
    data: RequestInfo["data"] = {},
    options: RequestConfigOptions = {},
  ) {
    return this.request<T>({
      method: "GET",
      data,
      url,
      ...options,
    } as RequestInfo);
  }

  /**
   * put请求
   * @param url 请求url
   * @param data 携带参数
   * @param options 请求配置
   */
  put<T = R>(
    url: RequestInfo["url"] = "",
    data: RequestInfo["data"] = {},
    options: RequestConfigOptions = {},
  ) {
    return this.request<T>({
      method: "PUT",
      data,
      url,
      ...options,
    } as RequestInfo);
  }

  /**
   * delete请求
   * @param url 请求url
   * @param data 携带参数
   * @param options 请求配置
   */
  delete<T = R>(
    url: RequestInfo["url"] = "",
    data: RequestInfo["data"] = {},
    options: RequestConfigOptions = {},
  ) {
    return this.request<T>({
      method: "DELETE",
      data,
      url,
      ...options,
    } as RequestInfo);
  }
}

export default Request;
export type {
  CustomRequestConfig,
  DispatchResult,
  FieldMapping,
  RequestConfig,
  RequestConfigOptions,
  RequestEndInterceptor,
  RequestError,
  RequestErrorInterceptor,
  RequestInfo,
  RequestInterceptor,
  RequestInterceptors,
  RequestOptions,
  RequestPromise,
  ResponseData,
  ResponseInterceptor,
  WxReqOpts,
  WxReqOptsNoFn,
} from "./types";
