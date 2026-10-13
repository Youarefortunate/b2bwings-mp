import { ModalProps } from "./type";

export const modalProps = (): ModalProps => ({
  /** 操作栏 */
  actions: {
    type: Array,
    value: [],
  },
  /** 多按钮排列方式 */
  buttonLayout: {
    type: String,
    value: "horizontal",
  },
  /** 取消按钮配置 */
  cancelBtn: {
    type: null,
  },
  /** 是否展示关闭按钮或关闭图标配置 */
  closeBtn: {
    type: null,
    value: false,
  },
  /** 点击蒙层时是否触发关闭事件 */
  closeOnOverlayClick: {
    type: Boolean,
    value: false,
  },
  /** 确认按钮配置 */
  confirmBtn: {
    type: null,
  },
  /** 内容 */
  content: {
    type: String,
  },
  /** 透传至遮罩层 */
  overlayProps: {
    type: Object,
    value: {},
  },
  /** 防止滚动穿透 */
  preventScrollThrough: {
    type: Boolean,
    value: true,
  },
  /** 是否显示遮罩层 */
  showOverlay: {
    type: Boolean,
    value: true,
  },
  /** 标题 */
  title: {
    type: String,
  },
  /** 是否使用了自定义导航栏 */
  usingCustomNavbar: {
    type: Boolean,
    value: false,
  },
  /** 控制弹窗是否显示 */
  visible: {
    type: Boolean,
  },
  /** 弹窗层级 */
  zIndex: {
    type: Number,
    value: 11500,
  },
});
