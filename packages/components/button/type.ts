export interface ButtonProps {
  /**
   * 卡片 id
   */
  activityType?: {
    type: NumberConstructor;
    value?: number;
  };
  /**
   * 打开 APP 时向 APP 传递的参数
   * @default ''
   */
  appParameter?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 是否为块级元素
   * @default false
   */
  block?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 按钮内容
   */
  content?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 自定义 dataset
   */
  customDataset?: {
    type: null;
    value?: unknown;
  };
  /**
   * 是否禁用按钮
   */
  disabled?: {
    type: null;
    value?: boolean;
  };
  /**
   * 从消息小程序入口打开小程序的路径
   * @default ''
   */
  entrancePath?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 是否为幽灵按钮
   * @default false
   */
  ghost?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 指定按钮按下去的样式类
   * @default ''
   */
  hoverClass?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 按住后多久出现点击态，单位毫秒
   * @default 20
   */
  hoverStartTime?: {
    type: NumberConstructor;
    value?: number;
  };
  /**
   * 手指松开后点击态保留时间，单位毫秒
   * @default 70
   */
  hoverStayTime?: {
    type: NumberConstructor;
    value?: number;
  };
  /**
   * 是否阻止祖先节点出现点击态
   * @default false
   */
  hoverStopPropagation?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 图标名称或图标配置
   */
  icon?: {
    type: null;
    value?: string | Record<string, unknown>;
  };
  /**
   * 指定返回用户信息的语言
   */
  lang?: {
    type: StringConstructor;
    value?: "en" | "zh_CN" | "zh_TW";
  };
  /**
   * 是否显示为加载状态
   * @default false
   */
  loading?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 加载图标配置
   */
  loadingProps?: {
    type: ObjectConstructor;
    value?: Record<string, unknown>;
  };
  /**
   * 加载图标类型
   * @default 'circle'
   */
  loadingType?: {
    type: StringConstructor;
    value?: "circle" | "spinner";
  };
  /**
   * 转发的文本消息是否带小程序入口
   * @default true
   */
  needShowEntrance?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 微信开放能力
   */
  openType?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 手机号额度用尽时是否展示默认提示
   * @default true
   */
  phoneNumberNoQuotaToast?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 会话内消息卡片图片
   * @default '截图'
   */
  sendMessageImg?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 会话内消息卡片点击跳转小程序路径
   * @default '当前分享路径'
   */
  sendMessagePath?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 会话内消息卡片标题
   * @default '当前标题'
   */
  sendMessageTitle?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 会话来源
   * @default ''
   */
  sessionFrom?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 按钮形状
   * @default 'rectangle'
   */
  shape?: {
    type: StringConstructor;
    value?: "rectangle" | "square" | "round" | "circle";
  };
  /**
   * 是否显示会话内消息卡片
   * @default false
   */
  showMessageCard?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 组件尺寸
   * @default 'medium'
   */
  size?: {
    type: StringConstructor;
    value?: "extra-small" | "small" | "medium" | "large";
  };
  /**
   * 按钮标签 id
   * @default ''
   */
  id?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 组件风格
   * @default 'default'
   */
  theme?: {
    type: StringConstructor;
    value?: "default" | "primary" | "danger" | "light";
  };
  /**
   * 同小程序 formType
   */
  type?: {
    type: StringConstructor;
    value?: "submit" | "reset";
  };
  /**
   * 按钮形式
   * @default 'base'
   */
  variant?: {
    type: StringConstructor;
    value?: "base" | "outline" | "dashed" | "text";
  };
}
