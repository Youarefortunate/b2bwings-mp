import type { RequestConfigOptions, RequestInfo } from "../../../request/types";
import type { PaginationConfig, ParamsOrFn } from "../../../pageRequest/types";

interface RequestArgsConfigBase {
  /** 接口地址 */
  url: RequestInfo["url"];
  /** 初始参数 */
  params?: ParamsOrFn;
  /** 请求配置项 */
  options?: RequestConfigOptions;
}

/** useRequest 对象入参 */
export type UseRequestConfig = RequestArgsConfigBase;

/** usePageRequest 对象入参 */
export interface UsePageRequestConfig extends RequestArgsConfigBase {
  /** 分页配置 */
  pagination?: Partial<PaginationConfig>;
}

type NormalizedRequestArgs<TConfig extends RequestArgsConfigBase> = Required<
  Pick<TConfig, "url" | "params" | "options">
>;

/** useRequest 归一化后的参数 */
export type NormalizedUseRequestArgs = NormalizedRequestArgs<UseRequestConfig>;

/** usePageRequest 归一化后的参数 */
export type NormalizedUsePageRequestArgs =
  NormalizedRequestArgs<UsePageRequestConfig> & {
    /** 分页配置 */
    pagination: Partial<PaginationConfig>;
  };

export type UseRequestArgs =
  | [UseRequestConfig]
  | [
      RequestInfo["url"],
      ParamsOrFn?,
      RequestConfigOptions?,
      RequestInfo["method"]?,
    ];

export type UsePageRequestArgs =
  | [UsePageRequestConfig]
  | [
      RequestInfo["url"],
      ParamsOrFn?,
      RequestConfigOptions?,
      Partial<PaginationConfig>?,
      RequestInfo["method"]?,
    ];
