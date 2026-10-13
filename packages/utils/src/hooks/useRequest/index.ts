import type {
  RequestInfo,
  RequestError,
  RequestPromise,
} from "../../request/types";
import type {
  UseRequestReturn,
  RequestResult,
  BeforeFetchCallback,
} from "./types";
import type Request from "../../request/index";
import { ResponseFieldMapper } from "../../request/mapping";
import {
  normalizeUseRequestArgs,
  type UseRequestArgs,
} from "../shared/requestArgs/index";

/**
 * 创建自定义请求 Hook
 * @param request 请求实例
 */
export function createUseRequest<R = any>(request: Request<R>) {
  /**
   * 自定义请求 Hook
   * @param url 接口地址
   * @param params 初始参数
   * @param options 配置项
   */
  return function useRequest<T = any>(
    ...args: UseRequestArgs
  ): UseRequestReturn<T> {
    // 参数归一化
    const { url, params, options } = normalizeUseRequestArgs(args);

    let code = 0;
    let data: T | null = null;
    let message = "";
    let loading = false;
    let error: RequestError | Error | null = null;
    let requestTask: WechatMiniprogram.RequestTask | null = null;
    let isCancelled = false;

    const getCancelResult = (): RequestResult<T> => ({
      code: 0,
      data: null,
      message: "Request cancelled",
      error: new Error("Request cancelled"),
      loading: false,
    });

    const applyCancelState = () => {
      isCancelled = true;
      const cancelResult = getCancelResult();
      code = cancelResult.code;
      data = cancelResult.data;
      message = cancelResult.message;
      error = cancelResult.error;
      loading = cancelResult.loading;
    };

    const cacheParams = params;
    const _beforeFetchCache: BeforeFetchCallback[] = [];

    const beforeFetch = (callback: BeforeFetchCallback) => {
      _beforeFetchCache.push(callback);
    };

    const fetch = (
      extraParams: RequestInfo["data"] | (() => RequestInfo["data"]) = {},
    ): RequestPromise<RequestResult<T>> => {
      code = 0;
      data = null;
      message = "";
      error = null;
      loading = true;
      requestTask = null;
      isCancelled = false;

      // 合并参数
      const finalParams: RequestInfo["data"] = {};
      if (typeof cacheParams === "function") {
        Object.assign(finalParams, cacheParams());
      } else if (cacheParams) {
        Object.assign(finalParams, cacheParams);
      }
      if (typeof extraParams === "function") {
        Object.assign(finalParams, extraParams());
      } else if (extraParams) {
        Object.assign(finalParams, extraParams);
      }

      const config: RequestInfo = {
        url,
        data: finalParams,
        ...options,
      };

      _beforeFetchCache.forEach((cb) => cb(config));

      const requestPromise = request.request(config);
      const currentRequestTask = requestPromise.requestTask ?? null;
      requestTask = currentRequestTask;

      const promise = new Promise<RequestResult<T>>((resolve) => {
        requestPromise
          .then(async (result) => {
            if (isCancelled) {
              resolve(getCancelResult());
              return;
            }
            const mapper = new ResponseFieldMapper({
              ...request.config.mapping,
              ...config.mapping,
            });
            code = mapper.getCode(result);
            message = mapper.getMessage(result);

            if (code !== 200) {
              message = message || "Request failed";
              error = {
                statusCode: code,
                errMsg: message,
                response: result,
              } as RequestError;
            } else {
              message = message || "Request successful";
              data = mapper.getData<T>(result);
              error = null;
            }
            resolve({ code, data, message, error, loading: false });
          })
          .catch((e) => {
            if (isCancelled) {
              resolve(getCancelResult());
              return;
            }
            const err = e as RequestError;
            code = typeof err.statusCode === "number" ? err.statusCode : 500;
            message = err.errMsg || "Unknown error";
            error = err;
            resolve({ code, data, message, error, loading: false });
          })
          .finally(() => {
            loading = false;
          });
      }) as RequestPromise<RequestResult<T>>;

      promise.requestTask = currentRequestTask ?? undefined;
      return promise;
    };

    const cancel = () => {
      if (requestTask) {
        requestTask.abort();
        applyCancelState();
      }
    };

    return {
      state: {
        get code() {
          return code;
        },
        get data() {
          return data;
        },
        get message() {
          return message;
        },
        get loading() {
          return loading;
        },
        get error() {
          return error;
        },
      },
      fetch,
      cancel,
      beforeFetch,
    };
  };
}
