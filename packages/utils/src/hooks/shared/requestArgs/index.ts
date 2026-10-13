import { isPlainObject } from "../../../utils";
import { hasRequestMethodPrefix } from "../../../request/utils";
import type { RequestConfigOptions, RequestInfo } from "../../../request/types";
import type {
  NormalizedUsePageRequestArgs,
  NormalizedUseRequestArgs,
  UsePageRequestArgs,
  UseRequestArgs,
} from "./types";

export type {
  NormalizedUsePageRequestArgs,
  NormalizedUseRequestArgs,
  UsePageRequestArgs,
  UseRequestArgs,
  UsePageRequestConfig,
  UseRequestConfig,
} from "./types";

const isConfigArg = (value: unknown): value is { url: RequestInfo["url"] } =>
  isPlainObject(value) && "url" in (value as Record<PropertyKey, unknown>);

const normalizeOptions = (
  url: RequestInfo["url"],
  options: RequestConfigOptions,
): RequestConfigOptions => {
  if (options.method || hasRequestMethodPrefix(url)) {
    return options;
  }

  return {
    ...options,
    method: "POST",
  };
};

/**
 * 归一化 useRequest 入参，兼容原多参写法和对象写法
 * @param args useRequest 入参
 */
export const normalizeUseRequestArgs = (
  args: UseRequestArgs,
): NormalizedUseRequestArgs => {
  const [firstArg, params = {}, options = {}, method] = args;

  if (isConfigArg(firstArg)) {
    return {
      url: firstArg.url,
      params: firstArg.params ?? {},
      options: normalizeOptions(firstArg.url, firstArg.options ?? {}),
    };
  }

  return {
    url: firstArg,
    params,
    options: normalizeOptions(firstArg, { method, ...options }),
  };
};

/**
 * 归一化 usePageRequest 入参，兼容原多参写法和对象写法
 * @param args usePageRequest 入参
 */
export const normalizeUsePageRequestArgs = (
  args: UsePageRequestArgs,
): NormalizedUsePageRequestArgs => {
  const [firstArg, params = {}, options = {}, pagination = {}, method] = args;

  if (isConfigArg(firstArg)) {
    return {
      url: firstArg.url,
      params: firstArg.params ?? {},
      options: normalizeOptions(firstArg.url, firstArg.options ?? {}),
      pagination: firstArg.pagination ?? {},
    };
  }

  return {
    url: firstArg,
    params,
    options: normalizeOptions(firstArg, { method, ...options }),
    pagination,
  };
};
