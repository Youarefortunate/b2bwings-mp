export type ModalButtonLayout = "horizontal" | "vertical";

export type ModalTrigger = "confirm" | "cancel" | "close-btn" | "overlay";

export type ModalButtonCallback = (
  event: WechatMiniprogram.CustomEvent,
) => boolean | void;

export interface ModalButtonProps extends Record<string, unknown> {
  /** 按钮标签 id */
  id?: string;
  /** 按钮内容 */
  content?: string;
  /** 微信开放能力 */
  openType?: string;
  /** 是否为块级元素 */
  block?: boolean;
  /** 组件风格 */
  theme?: "default" | "primary" | "danger" | "light";
  /** 按钮形式 */
  variant?: "base" | "outline" | "dashed" | "text";
  /** 组件根节点样式类 */
  rootClass?: string | string[];
  /** 组件外部样式类 */
  xbdClass?: string | string[];
  /** 点击回调 */
  bindtap?: ModalButtonCallback;
}

export interface ModalIconProps extends Record<string, unknown> {
  /** 图标名称或图片链接 */
  name?: string;
  /** 图标大小 */
  size?: string | number;
  /** 图标颜色 */
  color?: string;
  /** 组件外部样式类 */
  xbdClass?: string | string[];
}

export interface ModalOverlayProps extends Record<string, unknown> {
  /** 遮罩层样式 */
  style?: string | Record<string, unknown>;
  /** 遮罩层样式类 */
  xbdClass?: string | string[];
}

export interface ModalProps {
  /**
   * 操作栏
   */
  actions?: {
    type: ArrayConstructor;
    value?: ModalButtonProps[];
  };
  /**
   * 多按钮排列方式
   * @default 'horizontal'
   */
  buttonLayout?: {
    type: StringConstructor;
    value?: ModalButtonLayout;
  };
  /**
   * 取消按钮配置
   */
  cancelBtn?: {
    type: null;
    value?: string | ModalButtonProps | null;
  };
  /**
   * 是否展示关闭按钮或关闭图标配置
   * @default false
   */
  closeBtn?: {
    type: null;
    value?: boolean | ModalIconProps | null;
  };
  /**
   * 点击蒙层时是否触发关闭事件
   * @default false
   */
  closeOnOverlayClick?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 确认按钮配置
   */
  confirmBtn?: {
    type: null;
    value?: string | ModalButtonProps | null;
  };
  /**
   * 内容
   */
  content?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 透传至遮罩层
   * @default {}
   */
  overlayProps?: {
    type: ObjectConstructor;
    value?: ModalOverlayProps;
  };
  /**
   * 防止滚动穿透
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
   * 标题
   */
  title?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 是否使用了自定义导航栏
   * @default false
   */
  usingCustomNavbar?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 控制弹窗是否显示
   */
  visible?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 弹窗层级
   * @default 11500
   */
  zIndex?: {
    type: NumberConstructor;
    value?: number;
  };
}
