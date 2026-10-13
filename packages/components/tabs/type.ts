import type { TabItemValue } from "../tab-item/type";

/** Tabs 选项卡值 */
export type TabValue = string | number | null;

/** Tabs 动画配置 */
export type TabAnimation = { duration: number } & Record<string, unknown>;

/**
 * 激活下划线的模式
 * @enum "fixed" | "auto" | "full"
 * fixed: 固定
 * auto: 自动
 * full: 全宽
 */
export type TabBottomLineMode = "fixed" | "auto" | "full";

/** Tabs 属性 */
export interface TabsProps {
  /**
   * 动画效果设置，其中 duration 表示动画时长，单位秒
   */
  animation?: {
    type: ObjectConstructor;
    value?: Partial<TabAnimation>;
  };
  /**
   * 激活下划线的模式
   * @default 'fixed'
   */
  bottomLineMode?: {
    type: StringConstructor;
    value?: TabBottomLineMode;
  };
  /**
   * 是否展示底部激活线条
   * @default true
   */
  showBottomLine?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 选项卡头部空间是否均分
   * @default true
   */
  spaceEvenly?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否展示分割线
   * @default true
   */
  split?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否开启粘性布局
   * @default false
   */
  sticky?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 透传至 Sticky 组件
   */
  stickyProps?: {
    type: ObjectConstructor;
    value?: Record<string, unknown>;
  };
  /**
   * 是否可以滑动切换
   * @default true
   */
  swipeable?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 标签的样式
   * @default 'line'
   */
  theme?: {
    type: StringConstructor;
    value?: "line" | "tag" | "segment";
  };
  /**
   * 激活的选项卡值
   */
  value?: {
    type: null;
    value?: TabValue;
  };
  /**
   * 激活的选项卡默认值，非受控属性
   */
  defaultValue?: {
    type: null;
    value?: TabValue;
  };
  /**
   * 是否开启神奇过渡效果
   * @default false
   */
  magical?: {
    type: BooleanConstructor;
    value?: boolean;
  };
}

/** 选项卡节点项数据 */
export interface TabItem {
  /** 选项卡头部展示文案 */
  label?: string;
  /** 选项卡标识值 */
  value?: TabItemValue;
  /** 图标属性配置 */
  icon?: string | Record<string, unknown>;
  /** 红点或微标配置 */
  badgeProps?: Record<string, unknown>;
  /** 是否展示红点/微标 */
  hasBadge?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/** TabItem 子组件 this 实例 */
export interface TabItemInstance
  extends WechatMiniprogram.Component.TrivialInstance {
  /** 子组件在父组件中的索引 */
  index: number;
  /** 是否已初始化渲染 */
  initialized?: boolean;
  /** 获取计算后的标识名称（优先使用 value，无 value 则使用索引） */
  getComputedName(): string;
  /**
   * 渲染子组件的激活状态
   * @param active 是否激活
   * @param parent 父组件 tabs 实例
   */
  render(
    active: boolean,
    parent: WechatMiniprogram.Component.TrivialInstance,
  ): void;
  /** 设置子组件唯一 ID */
  setId(id: string): void;
  /** 子组件 runtime 选项数据 */
  data: WechatMiniprogram.Component.DataOption &
    Omit<TabItem, "hasBadge"> & {
      /** 是否激活 */
      active?: boolean;
      /** 曾经是否被激活（用作懒加载控制） */
      hasActivated?: boolean;
    };
}

/** 滑动切换手势状态 */
export interface TouchState {
  /** 起始触摸横坐标 */
  startX?: number;
  /** 起始触摸纵坐标 */
  startY?: number;
  /** 横向滑动距离 */
  deltaX?: number;
  /** 横向滑动距离绝对值 */
  offsetX?: number;
  /** 判定的滑动方向 */
  direction?: "horizontal" | "vertical";
}
