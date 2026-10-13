import { ButtonProps } from "./type";

export const buttonProps = (): ButtonProps => ({
  /** 卡片 id */
  activityType: {
    type: Number,
  },
  /** 打开 APP 时向 APP 传递的参数 */
  appParameter: {
    type: String,
    value: "",
  },
  /** 是否为块级元素 */
  block: {
    type: Boolean,
    value: false,
  },
  /** 按钮内容 */
  content: {
    type: String,
  },
  /** 自定义 dataset */
  customDataset: {
    type: null,
  },
  /** 是否禁用按钮 */
  disabled: {
    type: null,
    value: undefined,
  },
  /** 从消息小程序入口打开小程序的路径 */
  entrancePath: {
    type: String,
    value: "",
  },
  /** 是否为幽灵按钮 */
  ghost: {
    type: Boolean,
    value: false,
  },
  /** 指定按钮按下去的样式类 */
  hoverClass: {
    type: String,
    value: "",
  },
  /** 按住后多久出现点击态，单位毫秒 */
  hoverStartTime: {
    type: Number,
    value: 20,
  },
  /** 手指松开后点击态保留时间，单位毫秒 */
  hoverStayTime: {
    type: Number,
    value: 70,
  },
  /** 是否阻止祖先节点出现点击态 */
  hoverStopPropagation: {
    type: Boolean,
    value: false,
  },
  /** 图标名称或图标配置 */
  icon: {
    type: null,
  },
  /** 指定返回用户信息的语言 */
  lang: {
    type: String,
  },
  /** 是否显示为加载状态 */
  loading: {
    type: Boolean,
    value: false,
  },
  /** 加载图标配置 */
  loadingProps: {
    type: Object,
  },
  /** 加载图标类型 */
  loadingType: {
    type: String,
    value: "circle",
  },
  /** 转发的文本消息是否带小程序入口 */
  needShowEntrance: {
    type: Boolean,
    value: true,
  },
  /** 微信开放能力 */
  openType: {
    type: String,
  },
  /** 手机号额度用尽时是否展示默认提示 */
  phoneNumberNoQuotaToast: {
    type: Boolean,
    value: true,
  },
  /** 会话内消息卡片图片 */
  sendMessageImg: {
    type: String,
    value: "截图",
  },
  /** 会话内消息卡片点击跳转小程序路径 */
  sendMessagePath: {
    type: String,
    value: "当前分享路径",
  },
  /** 会话内消息卡片标题 */
  sendMessageTitle: {
    type: String,
    value: "当前标题",
  },
  /** 会话来源 */
  sessionFrom: {
    type: String,
    value: "",
  },
  /** 按钮形状 */
  shape: {
    type: String,
    value: "rectangle",
  },
  /** 是否显示会话内消息卡片 */
  showMessageCard: {
    type: Boolean,
    value: false,
  },
  /** 组件尺寸 */
  size: {
    type: String,
    value: "medium",
  },
  /** 按钮标签 id */
  id: {
    type: String,
    value: "",
  },
  /** 组件风格 */
  theme: {
    type: String,
    value: "default",
  },
  /** 同小程序 formType */
  type: {
    type: String,
  },
  /** 按钮形式 */
  variant: {
    type: String,
    value: "base",
  },
});
