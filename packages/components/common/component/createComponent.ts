import { normalizeOptions } from "./normalizeOptions";
import type { ComponentOptions } from "./types";

/**
 * 创建组件库标准组件
 */
export const createComponent = <
  TProperty extends WechatMiniprogram.Component.PropertyOption =
    WechatMiniprogram.Component.PropertyOption,
  TData extends WechatMiniprogram.Component.DataOption =
    WechatMiniprogram.Component.DataOption,
  TMethod extends WechatMiniprogram.Component.MethodOption =
    WechatMiniprogram.Component.MethodOption,
>(
  options: ComponentOptions<
    TProperty & Record<string, any>,
    TData & Record<string, any>,
    TMethod
  >,
) => Component(normalizeOptions(options));
