import type { TabAnimation } from "../tabs/type";

/** TabItem 选项卡值 */
export type TabItemValue = string | number;

/** TabItem 属性 */
export interface TabItemProps {
  /**
   * 透传至 Badge 组件
   */
  badgeProps?: {
    type: ObjectConstructor;
    value?: Record<string, unknown>;
  };
  /**
   * 是否禁用当前选项卡
   * @default false
   */
  disabled?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 图标，字符串表示图标名称，对象透传至 Icon 组件
   */
  icon?: {
    type: null;
    value?: string | Record<string, unknown>;
  };
  /**
   * 选项卡名称
   * @default ''
   */
  label?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 是否启用选项卡懒加载
   * @default false
   */
  lazy?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 用于自定义选项卡面板内容
   */
  panel?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 选项卡的值，唯一标识
   */
  value?: {
    type: null;
    value?: TabItemValue;
  };
}

/** TabItem 父组件 Tabs 组件 this 实例 */
export interface TabItemParent
  extends WechatMiniprogram.Component.TrivialInstance {
  data: WechatMiniprogram.Component.TrivialInstance["data"] & {
    /** 动画效果设置，其中 duration 表示动画时长，单位秒 */
    animation?: Partial<TabAnimation>;
  };
  /** 更新选项卡 */
  updateTabs?: () => void;
}
