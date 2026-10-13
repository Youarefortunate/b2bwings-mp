import type Request from "../request/index";
import type { RequestInfo, RequestPromise } from "../request/types";
import type {
  PageRequestConfig,
  PaginationConfig,
  BeforeFetchCallback,
  AfterFetchCallback,
  ParamsOrFn,
} from "./types";
import { ResponseFieldMapper } from "../request/mapping";

/** 默认分页配置 */
const DEFAULT_PAGINATION: PaginationConfig = {
  current: 1,
  size: 20,
  total: 0,
  hasMore: true,
  onChange: null,
  onShowSizeChange: null,
};

/**
 * 分页请求类，封装分页逻辑和请求生命周期
 */
export default class PageRequest {
  /** 请求地址 */
  readonly url: RequestInfo["url"];
  /** 缓存的请求参数 */
  private cacheParams: ParamsOrFn;
  /** 请求前的回调列表 */
  private beforeFetchCallbacks: BeforeFetchCallback[] = [];
  /** 请求后的回调列表 */
  private afterFetchCallbacks: AfterFetchCallback[] = [];
  /** 请求选项 */
  private requestOptions: RequestInfo;
  /** 请求实例 */
  private _request: Request;

  /** 分页配置 */
  pagination: PaginationConfig;

  constructor(config: PageRequestConfig) {
    this.url = config.url;
    this.cacheParams = config.params || {};
    this._request = config.request;

    this.requestOptions = {
      url: this.url,
      ...config.options,
    };

    this.pagination = {
      ...DEFAULT_PAGINATION,
      ...this._request.config.pagination,
      ...config.pagination,
    };
  }

  /**
   * 添加请求前的回调
   * @param callback 回调函数，接收最终合并后的参数
   */
  beforeFetch(callback: BeforeFetchCallback) {
    this.beforeFetchCallbacks.push(callback);
  }

  /**
   * 添加请求后的回调
   * @param callback 回调函数，接收响应数据
   */
  afterFetch(callback: AfterFetchCallback) {
    this.afterFetchCallbacks.push(callback);
  }

  /**
   * 执行请求
   * @param extraParams 额外参数，可以是对象或返回对象的函数
   */
  fetch(extraParams: ParamsOrFn = {}): RequestPromise<any> {
    // 合并参数
    const finalParams: RequestInfo["data"] = {};

    if (typeof this.cacheParams === "function") {
      Object.assign(finalParams, this.cacheParams());
    } else {
      Object.assign(finalParams, this.cacheParams);
    }

    const mapper = new ResponseFieldMapper({
      ...this._request.config.mapping,
      ...this.requestOptions.mapping,
    });

    // 添加分页参数
    Object.assign(finalParams, {
      [mapper.getCurrentKey()]: this.pagination.current,
      [mapper.getSizeKey()]: this.pagination.size,
    });

    if (typeof extraParams === "function") {
      Object.assign(finalParams, extraParams());
    } else {
      Object.assign(finalParams, extraParams);
    }

    this.beforeFetchCallbacks.forEach((callback) => callback(finalParams));

    const config: RequestInfo = {
      ...this.requestOptions,
      url: this.url,
      data: finalParams,
    };

    const requestPromise = this._request.request(config);
    const requestTask = requestPromise.requestTask;

    const promise = requestPromise.then((response) => {
      this.afterFetchCallbacks.forEach((callback) => callback(response));
      return response;
    }) as RequestPromise<any>;

    promise.requestTask = requestTask;
    return promise;
  }

  /** 刷新数据（重置到第一页） */
  refresh() {
    this.pagination.current = 1;
    return this.fetch();
  }
}
