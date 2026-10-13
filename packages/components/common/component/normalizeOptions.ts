import { sharedPropertiesBehavior } from "../behaviors/index";
import { applyControlledProps } from "./applyControlledProps";
import { applyRelations } from "./applyRelations";
import type { ComponentOptions } from "./types";
import { canUseVirtualHost } from "../version";

const mergeUnique = <T>(items: T[]) => Array.from(new Set(items));

/**
 * 归一化组件 options
 */
export const normalizeOptions = <
  TProperty extends WechatMiniprogram.Component.PropertyOption,
>(
  ops: ComponentOptions<TProperty>,
): ComponentOptions<TProperty> => {
  const options = applyRelations(applyControlledProps(ops));

  const {
    addGlobalClass = true,
    multipleSlots = true,
    virtualHost = canUseVirtualHost(),
    ...restOptions
  } = options.options || {};

  return {
    ...options,
    behaviors: mergeUnique([
      sharedPropertiesBehavior(),
      ...(options.behaviors || []),
    ]),
    externalClasses: mergeUnique(["class", ...(options.externalClasses || [])]),
    options: {
      addGlobalClass,
      multipleSlots,
      virtualHost,
      ...restOptions,
    },
  };
};
