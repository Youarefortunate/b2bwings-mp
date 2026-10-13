import { getInstance } from "../common/index";
import { modalProps } from "./props";
import type { ModalButtonLayout, ModalButtonProps } from "./type";

/** 微信小程序页面或组件实例上下文 */
type Context =
  | WechatMiniprogram.Page.TrivialInstance
  | WechatMiniprogram.Component.TrivialInstance;

/** 弹窗组件实例 */
type ModalInstance = WechatMiniprogram.Component.TrivialInstance & {
  /** 组件属性记录 */
  properties: Record<string, unknown>;
  /** 设置组件数据 */
  setData(data: Record<string, unknown>): void;
  /** 关闭弹窗 */
  close(): void;
  /** 确认回调事件 */
  _onConfirm?: (detail: { trigger: "confirm" }) => void;
  /** 取消回调事件 */
  _onCancel?: (detail: { trigger: "cancel" | "close-btn" | "overlay" }) => void;
  /** 操作按钮回调事件 */
  _onAction?: (detail: { index: number }) => void;
};

/** 警告弹窗配置选项 */
export interface ModalAlertOptions {
  /** 组件上下文实例 */
  context?: Context;
  /** 组件选择器 */
  selector?: string;
  /** 弹窗标题 */
  title?: string;
  /** 弹窗内容 */
  content?: string;
  /** 弹窗层级 */
  zIndex?: number;
  /** 是否异步关闭 */
  asyncClose?: boolean;
  /** 确认按钮文本 */
  confirmButtonText?: string;
  /** 内容文本对齐方式 */
  textAlign?: string;
  /** 取消按钮配置 */
  cancelBtn?: string | ModalButtonProps | null;
  /** 确认按钮配置 */
  confirmBtn?: string | ModalButtonProps | null;
  /** 是否显示遮罩层 */
  showOverlay?: boolean;
  /** 点击遮罩层是否可关闭 */
  closeOnOverlayClick?: boolean;
  /** 是否阻止滑动穿透 */
  preventScrollThrough?: boolean;
}

/** 确认弹窗配置选项 */
export interface ModalConfirmOptions extends ModalAlertOptions {
  /** 取消按钮文本 */
  cancelButtonText?: string;
}

/** 操作弹窗配置选项 */
export interface ModalActionOptions {
  /** 组件上下文实例 */
  context?: Context;
  /** 组件选择器 */
  selector?: string;
  /** 弹窗标题 */
  title?: string;
  /** 弹窗内容 */
  content?: string;
  /** 弹窗层级 */
  zIndex?: number;
  /** 是否异步关闭 */
  asyncClose?: boolean;
  /** 操作按钮列表 */
  actions?: ModalButtonProps[];
  /** 按钮排列方向 */
  buttonLayout?: ModalButtonLayout;
}

const props = modalProps();
const defaultOptions = {
  actions: props.actions?.value || [],
  buttonLayout: props.buttonLayout?.value,
  cancelBtn: props.cancelBtn?.value,
  closeOnOverlayClick: props.closeOnOverlayClick?.value,
  confirmBtn: props.confirmBtn?.value,
  content: "",
  preventScrollThrough: props.preventScrollThrough?.value,
  showOverlay: props.showOverlay?.value,
  title: "",
  visible: props.visible?.value,
};

const getModalInstance = (context?: Context, selector = "#xbd-modal") =>
  getInstance(context, selector) as ModalInstance | null;

export const alert = (options: ModalAlertOptions) => {
  const { context, selector, ...otherOptions } = { ...options };
  const instance = getModalInstance(context, selector);
  if (!instance) return Promise.reject();

  return new Promise((resolve) => {
    const mergedOptions = {
      ...defaultOptions,
      ...instance.properties,
      ...otherOptions,
    };

    instance.setData({
      ...mergedOptions,
      cancelBtn: "",
      visible: true,
    });
    instance._onConfirm = resolve;
  });
};

export const confirm = (options: ModalConfirmOptions) => {
  const { context, selector, ...otherOptions } = { ...options };
  const instance = getModalInstance(context, selector);
  if (!instance) return Promise.reject();

  return new Promise((resolve, reject) => {
    const mergedOptions = {
      ...defaultOptions,
      ...instance.properties,
      ...otherOptions,
    };

    instance.setData({
      ...mergedOptions,
      visible: true,
    });
    instance._onConfirm = resolve;
    instance._onCancel = reject;
  });
};

export const close = (options?: ModalConfirmOptions) => {
  const { context, selector } = { ...options };
  const instance = getModalInstance(context, selector);

  if (instance) {
    instance.close();
    return Promise.resolve();
  }

  return Promise.reject();
};

export const action = (
  options: ModalActionOptions,
): Promise<{ index: number }> => {
  const { context, selector, ...otherOptions } = { ...options };
  const instance = getModalInstance(context, selector);
  if (!instance) return Promise.reject();

  const { buttonLayout = "vertical" } = options;
  const actions = (options.actions || instance.properties.actions) as
    | ModalButtonProps[]
    | undefined;
  const maxLengthSuggestion = buttonLayout === "vertical" ? 7 : 3;

  if (
    !actions ||
    (Array.isArray(actions) &&
      (actions.length === 0 || actions.length > maxLengthSuggestion))
  ) {
    console.warn(`action 数量建议控制在 1 至 ${maxLengthSuggestion} 个`);
  }

  return new Promise((resolve) => {
    const mergedOptions = {
      ...defaultOptions,
      ...instance.properties,
      ...otherOptions,
    };

    instance.setData({
      ...mergedOptions,
      buttonLayout,
      visible: true,
    });
    instance._onAction = resolve;
  });
};

export default {
  alert,
  confirm,
  close,
  action,
};
