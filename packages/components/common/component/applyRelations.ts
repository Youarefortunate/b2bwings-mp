import type { ComponentOptions } from "./types";
import { getRelationBehavior } from "../behaviors/index";

/**
 * 为 relations 注入便捷访问器 Behavior
 */
export const applyRelations = <
  TProperty extends WechatMiniprogram.Component.PropertyOption,
>(
  options: ComponentOptions<TProperty>,
): ComponentOptions<TProperty> => {
  const { relations } = options;

  if (!relations) return options;

  const relationBehaviors: Record<
    string,
    WechatMiniprogram.Behavior.BehaviorIdentifier
  > = {};

  Object.keys(relations).forEach((path) => {
    const relation = ["parent", "ancestor"].includes(relations[path].type)
      ? "parent"
      : "children";

    relationBehaviors[relation] = getRelationBehavior(relation, path);
  });

  return {
    ...options,
    behaviors: [
      ...(options.behaviors || []),
      ...Object.values(relationBehaviors),
    ],
  };
};
