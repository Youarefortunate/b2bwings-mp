import type { RequestError, RequestPromise } from "../../request/types";
import type { ParamsOrFn } from "../../pageRequest/types";
import type { UsePageRequestReturn, PageRequestResult } from "./types";
import type Request from "../../request/index";
import PageRequest from "../../pageRequest/index";
import { ResponseFieldMapper } from "../../request/mapping";
import {
  normalizeUsePageRequestArgs,
  type UsePageRequestArgs,
} from "../shared/requestArgs/index";

/**
 * 创建分页请求 Hook
 * @param request 请求实例
 */
export function createUsePageRequest<R = any>(request: Request<R>) {
  /**
   * 分页请求 Hook
   * @param url 接口地址
   * @param params 初始参数
   * @param options 配置项
   * @param pagination 分页配置
   */
  return function usePageRequest<T = any>(
    ...args: UsePageRequestArgs
  ): UsePageRequestReturn<T> {
    // 参数归一化
    const { url, params, options, pagination } =
      normalizeUsePageRequestArgs(args);

    const mapper = new ResponseFieldMapper({
      ...request.config.mapping,
      ...options.mapping,
    });

    const instance = new PageRequest({
      url,
      params,
      pagination,
      options: {
        onRequestTask: (task) => {
          requestTask = task;
        },
        ...options,
      },
      request,
    });

    let loading = false;
    let record: T[] = [];
    let total = 0;
    let code = 0;
    let message = "";
    let error: RequestError | Error | null = null;
    let requestTask: WechatMiniprogram.RequestTask | null = null;
    let hasMore = true;
    let isCancelled = false;

    const createPageResult = (
      result: Partial<PageRequestResult<T>> = {},
    ): PageRequestResult<T> => ({
      code,
      record,
      total,
      message,
      error,
      loading: false,
      ...result,
    });

    const applyPageResult = (result: PageRequestResult<T>) => {
      code = result.code;
      record = result.record;
      total = result.total;
      message = result.message;
      error = result.error;
      loading = result.loading;
    };

    const getCancelPageResult = (): PageRequestResult<T> =>
      createPageResult({
        code: 0,
        record: [],
        total: 0,
        message: "请求已取消",
        error: new Error("请求已取消"),
      });

    const applyCancelState = () => {
      isCancelled = true;
      applyPageResult(getCancelPageResult());
    };

    const getCurrentPageResult = (): PageRequestResult<T> => createPageResult();

    const fetch = (
      extraParams: ParamsOrFn = {},
    ): RequestPromise<PageRequestResult<T>> => {
      loading = true;
      code = 0;
      message = "";
      error = null;
      requestTask = null;
      isCancelled = false;

      const pageFetchPromise = instance.fetch(extraParams);
      const currentRequestTask = pageFetchPromise.requestTask ?? null;
      requestTask = currentRequestTask;

      const promise = new Promise<PageRequestResult<T>>((resolve) => {
        const finish = (result: PageRequestResult<T> = createPageResult()) => {
          loading = false;
          resolve(result);
        };

        pageFetchPromise
          .then(async (response) => {
            if (isCancelled) {
              finish(getCancelPageResult());
              return;
            }
            code = mapper.getCode(response);
            message = mapper.getMessage(response);

            if (code === 200) {
              record = mapper.getList<T>(response);
              total = mapper.getTotal(response);

              message = message || "请求成功";
              instance.pagination.total = total;
              hasMore = instance.pagination.hasMore = mapper.getHasMore(
                response,
                instance.pagination.current,
                instance.pagination.size,
                total,
              );
              error = null;
            } else {
              message = message || "请求失败";
              error = new Error(message);
            }
            finish();
          })
          .catch((e) => {
            if (isCancelled) {
              finish(getCancelPageResult());
              return;
            }
            const err = e as RequestError;
            code = typeof err.statusCode === "number" ? err.statusCode : 500;
            message = err.errMsg || "请求错误！";
            error = err;
            finish();
          })
          .finally(() => {
            loading = false;
          });
      }) as RequestPromise<PageRequestResult<T>>;

      promise.requestTask = currentRequestTask ?? undefined;
      return promise;
    };

    // 绑定分页事件
    instance.pagination.onChange = (num) => {
      instance.pagination.current = num;
      fetch();
    };

    instance.pagination.onShowSizeChange = (current, size) => {
      instance.pagination.current = current;
      instance.pagination.size = size;
      fetch();
    };

    const refresh = (extraParams: ParamsOrFn = {}) => {
      instance.pagination.current = 1;
      return fetch(extraParams);
    };

    const next = async (extraParams: ParamsOrFn = {}) => {
      const previousPage = instance.pagination.current;
      instance.pagination.current = previousPage + 1;
      const result = await fetch(extraParams);

      // 请求失败时，current页码回滚
      if (result.code !== 200) {
        instance.pagination.current = previousPage;
      }

      return result;
    };

    const loadMore = () => {
      if (loading || !hasMore) {
        return Promise.resolve(getCurrentPageResult()) as RequestPromise<
          PageRequestResult<T>
        >;
      }

      return next();
    };

    const cancel = () => {
      if (requestTask) {
        requestTask.abort();
        applyCancelState();
      }
    };

    const reset = () => {
      instance.pagination.current = 1;
      instance.pagination.total = 0;
      instance.pagination.hasMore = true;
      hasMore = true;
      applyPageResult(
        createPageResult({
          code: 0,
          record: [],
          total: 0,
          message: "",
          error: null,
        }),
      );
    };

    return {
      state: {
        get loading() {
          return loading;
        },
        get record() {
          return record;
        },
        get total() {
          return total;
        },
        get code() {
          return code;
        },
        get message() {
          return message;
        },
        get error() {
          return error;
        },
        get hasMore() {
          return hasMore;
        },
      },
      fetch,
      refresh,
      next,
      loadMore,
      reset,
      cancel,
      pagination: instance.pagination,
      beforeFetch: instance.beforeFetch.bind(instance),
      afterFetch: instance.afterFetch.bind(instance),
    };
  };
}
