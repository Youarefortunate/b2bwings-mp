import { createComponent } from "../common/component/index";
import { config, isObject, toCamel } from "../common/index";
import { useCustomNavbarBehavior } from "../common/behaviors/index";
import { modalProps } from "./props";
import type { ModalButtonProps } from "./type";

const { prefix } = config;
const name = `${prefix}-modal`;

type ModalButtonKey = "confirm" | "cancel";
/** 弹窗按钮数据集 */
type ModalButtonDataset = {
  /** 按钮类型 */
  type?: ModalButtonKey | "action";
  /** 按钮额外参数 */
  extra?: number;
};

/** 弹窗按钮点击事件 */
type ModalButtonEvent = WechatMiniprogram.CustomEvent & {
  /** 当前触发事件的目标对象 */
  currentTarget: {
    /** 数据集 */
    dataset: ModalButtonDataset;
  };
};

/** 弹窗方法实例上下文 */
type ModalMethodContext = WechatMiniprogram.Component.TrivialInstance & {
  /** 组件数据 */
  data: Record<string, unknown>;
  /** 组件属性 */
  properties: Record<string, unknown>;
  /** 确认回调事件 */
  _onConfirm?: (detail: { trigger: "confirm" }) => void;
  /** 取消回调事件 */
  _onCancel?: (detail: { trigger: "cancel" | "close-btn" | "overlay" }) => void;
  /** 操作按钮回调事件 */
  _onAction?: (detail: { index: number }) => void;
  /** 关闭弹窗 */
  close: () => void;
  /** 确认回调 */
  onConfirm: (type?: ModalButtonKey) => void;
  /** 取消回调 */
  onCancel: (type?: ModalButtonKey) => void;
  /** 操作按钮点击回调 */
  onActionTap: (index: number) => void;
};

const normalizeButton = (
  button: unknown,
  key: ModalButtonKey,
  base: ModalButtonProps,
): ModalButtonProps | null => {
  if (typeof button === "string") {
    return { ...base, content: button };
  }

  if (isObject(button)) {
    return { ...base, ...button };
  }

  return null;
};

createComponent({
  externalClasses: [
    `${prefix}-class`,
    `${prefix}-class-content`,
    `${prefix}-class-confirm`,
    `${prefix}-class-cancel`,
    `${prefix}-class-action`,
  ],

  behaviors: [useCustomNavbarBehavior()],

  properties: {
    ...modalProps(),
  },

  data: {
    prefix,
    classPrefix: name,
    buttonVariant: "text",
    _confirm: null as ModalButtonProps | null,
    _cancel: null as ModalButtonProps | null,
  },

  observers: {
    "confirmBtn, cancelBtn"(confirm: unknown, cancel: unknown) {
      const { buttonLayout } = this.data;
      const buttonMap: Record<ModalButtonKey, unknown> = { confirm, cancel };
      const useBaseVariant = [confirm, cancel].some(
        (item) => isObject(item) && item.variant && item.variant !== "text",
      );
      const buttonVariant = useBaseVariant ? "base" : "text";
      const rootClass = [
        `${name}__button`,
        useBaseVariant
          ? `${name}__button--${buttonLayout}`
          : `${name}__button--text`,
      ];
      const externalClass = useBaseVariant ? [] : [`${name}-button`];
      const nextData: Record<string, unknown> = { buttonVariant };

      (Object.keys(buttonMap) as ModalButtonKey[]).forEach((key) => {
        const base: ModalButtonProps = {
          block: true,
          rootClass: [...rootClass, `${name}__button--${key}`],
          xbdClass: [...externalClass, `${prefix}-class-${key}`],
          variant: buttonVariant,
          openType: "",
        };

        if (key === "cancel" && buttonVariant === "base") {
          base.theme = "light";
        }

        nextData[`_${key}`] = normalizeButton(buttonMap[key], key, base);
      });

      this.setData(nextData);
    },
  },

  methods: {
    onTplButtonTap(this: ModalMethodContext, event: ModalButtonEvent) {
      const eventType = event.type;
      const { type, extra } = event.currentTarget.dataset;

      if (type === "action") {
        this.onActionTap(Number(extra));
        return;
      }

      if (!type) return;

      const button = this.data[`_${type}`] as ModalButtonProps | null;
      const callbackName = `bind${eventType}`;
      const callback = button?.[callbackName];

      if (typeof callback === "function" && callback(event)) {
        this.close();
      }

      if (!button?.openType) {
        const handler = this[toCamel(`on-${type}`) as "onConfirm" | "onCancel"];
        handler?.call(this, type);
      }

      if (eventType !== "tap") {
        const detail = event.detail as { errMsg?: string };
        const success = detail?.errMsg?.includes("ok");
        this.triggerEvent(
          success ? "open-type-event" : "open-type-error-event",
          event.detail,
        );
      }
    },

    onConfirm(this: ModalMethodContext) {
      this.triggerEvent("confirm");

      if (this._onConfirm) {
        this._onConfirm({ trigger: "confirm" });
        this.close();
      }
    },

    onCancel(this: ModalMethodContext) {
      const trigger = { trigger: "cancel" as const };

      this.triggerEvent("cancel");
      this.triggerEvent("close", trigger);

      if (this._onCancel) {
        this._onCancel(trigger);
        this.close();
      }
    },

    onClose(this: ModalMethodContext) {
      const trigger = { trigger: "close-btn" as const };

      this.triggerEvent("close", trigger);
      this._onCancel?.(trigger);
      this.close();
    },

    close() {
      this.setData({ visible: false });
    },

    overlayClick(this: ModalMethodContext) {
      this.triggerEvent("overlay-click");

      if (this.properties.closeOnOverlayClick) {
        const trigger = { trigger: "overlay" as const };

        this.triggerEvent("close", trigger);
        this._onCancel?.(trigger);
        this.close();
      }
    },

    onActionTap(this: ModalMethodContext, index: number) {
      this.triggerEvent("action", { index });

      if (this._onAction) {
        this._onAction({ index });
        this.close();
      }
    },
  },
});
