export type PopupPlacement = "top" | "left" | "right" | "bottom" | "center";

export type PopupHeaderAlign = "left" | "center" | "right";

export type PopupHeaderClosePosition = "left" | "right";

export interface PopupOverlayProps {
  /** 遮罩层级 */
  zIndex?: number;
  /** 遮罩动画时长 */
  duration?: number;
  /** 遮罩背景色 */
  backgroundColor?: string;
  /** 遮罩内联样式 */
  style?: string;
  /** 遮罩自定义样式 */
  customStyle?: string;
  /** 是否阻止背景滚动 */
  preventScrollThrough?: boolean;
}

export interface PopupProps {
  /**
   * 关闭按钮，值类型为 Boolean 时表示是否显示关闭按钮。也可以自定义关闭按钮
   */
  closeBtn?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 默认关闭按钮的属性配置，仅在 closeBtn 为 true 且未使用 close-btn 插槽时有效
   * @default {}
   */
  closeIconProps?: {
    type: ObjectConstructor;
    value?: Record<string, any>;
  };
  /**
   * 点击遮罩层是否关闭
   * @default true
   */
  closeOnOverlayClick?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 浮层里面的内容
   */
  content?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 是否使用完整自定义头部插槽
   * @default false
   */
  customHeader?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否使用自定义头部标题插槽
   * @default false
   */
  customHeaderTitle?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否使用自定义头部关闭图标插槽
   * @default false
   */
  customHeaderClose?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 头部标题
   */
  headerTitle?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 头部副标题
   */
  headerSubtitle?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 头部关闭图标位置
   * @default right
   */
  headerClosePosition?: {
    type: StringConstructor;
    value?: PopupHeaderClosePosition;
  };
  /**
   * 头部标题对齐方式
   * @default left
   */
  headerAlign?: {
    type: StringConstructor;
    value?: PopupHeaderAlign;
  };
  /**
   * 是否显示头部分割线
   * @default true
   */
  headerBorder?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否显示头部
   * @default false
   */
  showHeader?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 动画过渡时间
   * @default 240
   */
  duration?: {
    type: NumberConstructor;
    value?: number;
  };
  /**
   * 内置遮罩层配置
   * @default {}
   */
  overlayProps?: {
    type: ObjectConstructor;
    value?: PopupOverlayProps;
  };
  /**
   * 浮层出现位置
   * @default top
   */
  placement?: {
    type: StringConstructor;
    value?: PopupPlacement;
  };
  /**
   * 是否阻止背景滚动
   * @default true
   */
  preventScrollThrough?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否显示遮罩层
   * @default true
   */
  showOverlay?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否显示浮层
   */
  visible?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 是否显示浮层，非受控属性
   */
  defaultVisible?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 组件层级，Web 侧样式默认为 5500，移动端样式默认为 1500，小程序样式默认为11500
   * @default 11500
   */
  zIndex?: {
    type: NumberConstructor;
    value?: number;
  };
}
