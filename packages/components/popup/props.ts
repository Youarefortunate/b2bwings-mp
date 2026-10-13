import { PopupProps } from "./type";

export const popupProps = (): PopupProps => ({
  /** 是否显示关闭按钮 */
  closeBtn: {
    type: Boolean,
    value: false,
  },
  /** 默认关闭按钮的属性配置，仅在 closeBtn 为 true 且未使用 close-btn 插槽时有效 */
  closeIconProps: {
    type: Object,
    value: {},
  },
  /** 点击遮罩层是否关闭 */
  closeOnOverlayClick: {
    type: Boolean,
    value: true,
  },
  /** 浮层内容 */
  content: {
    type: String,
  },
  /** 是否使用完整自定义头部插槽 */
  customHeader: {
    type: Boolean,
    value: false,
  },
  /** 是否使用自定义头部标题插槽 */
  customHeaderTitle: {
    type: Boolean,
    value: false,
  },
  /** 是否使用自定义头部关闭图标插槽 */
  customHeaderClose: {
    type: Boolean,
    value: false,
  },
  /** 头部标题 */
  headerTitle: {
    type: String,
    value: "",
  },
  /** 头部副标题 */
  headerSubtitle: {
    type: String,
    value: "",
  },
  /** 头部关闭图标位置 */
  headerClosePosition: {
    type: String,
    value: "right",
  },
  /** 头部标题对齐方式 */
  headerAlign: {
    type: String,
    value: "left",
  },
  /** 是否显示头部分割线 */
  headerBorder: {
    type: Boolean,
    value: true,
  },
  /** 是否显示头部 */
  showHeader: {
    type: Boolean,
    value: false,
  },
  /** 动画过渡时间 */
  duration: {
    type: Number,
    value: 240,
  },
  /** 内置遮罩层配置 */
  overlayProps: {
    type: Object,
    value: {},
  },
  /** 浮层出现位置 */
  placement: {
    type: String,
    value: "top",
  },
  /** 是否阻止背景滚动 */
  preventScrollThrough: {
    type: Boolean,
    value: true,
  },
  /** 是否显示遮罩层 */
  showOverlay: {
    type: Boolean,
    value: true,
  },
  /** 是否显示浮层 */
  // visible: {
  //   type: Boolean,
  //   value: false,
  // },
  /** 是否显示浮层，非受控属性 */
  defaultVisible: {
    type: Boolean,
  },
  /** 组件层级 */
  zIndex: {
    type: Number,
    value: 11500,
  },
});
