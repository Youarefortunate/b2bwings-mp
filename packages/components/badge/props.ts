import { BadgeProps } from "./type";

export const badgeProps = (): BadgeProps => ({
  /** 徽标颜色 */
  color: {
    type: String,
    value: "",
  },
  /** 徽标包裹内容，未传入时渲染默认插槽 */
  content: {
    type: String,
    value: "",
  },
  /** 徽标内容，传入 null 时使用 count 插槽 */
  count: {
    type: null,
    value: 0,
  },
  /** 是否为红点徽标 */
  dot: {
    type: Boolean,
    value: false,
  },
  /** 数字封顶值 */
  maxCount: {
    type: Number,
    value: 99,
  },
  /** 徽标位置偏移 */
  offset: {
    type: Array,
    value: [],
  },
  /** 徽标形状 */
  shape: {
    type: String,
    value: "circle",
  },
  /** count 为 0 时是否显示徽标 */
  showZero: {
    type: Boolean,
    value: false,
  },
  /** 徽标尺寸 */
  size: {
    type: String,
    value: "medium",
  },
});
