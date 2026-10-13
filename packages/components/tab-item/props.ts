import type { TabItemProps } from "./type";

/** TabItem 属性配置 */
export const tabItemProps = (): TabItemProps => ({
  /** 透传至 Badge 组件 */
  badgeProps: {
    type: Object,
    value: {},
  },
  /** 是否禁用当前选项卡 */
  disabled: {
    type: Boolean,
    value: false,
  },
  /** 图标，字符串表示图标名称，对象透传至 Icon 组件 */
  icon: {
    type: null,
  },
  /** 选项卡名称 */
  label: {
    type: String,
    value: "",
  },
  /** 是否启用选项卡懒加载 */
  lazy: {
    type: Boolean,
    value: false,
  },
  /** 用于自定义选项卡面板内容 */
  panel: {
    type: String,
  },
  /** 选项卡的值，唯一标识 */
  value: {
    type: null,
  },
});
