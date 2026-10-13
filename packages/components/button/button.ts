import { createComponent } from "../common/component/index";
import { calcIcon, canIUseFormFieldButton, config } from "../common/index";
import { buttonProps } from "./props";

const { prefix } = config;
const name = `${prefix}-button`;

createComponent({
  externalClasses: [
    `${prefix}-class`,
    `${prefix}-class-icon`,
    `${prefix}-class-loading`,
  ],

  behaviors: canIUseFormFieldButton() ? ["wx://form-field-button"] : [],

  properties: {
    ...buttonProps(),
  },

  data: {
    prefix,
    className: "",
    classPrefix: name,
    loadingIndexes: Array.from({ length: 8 }, (_, index) => index),
    _icon: null as Record<string, unknown> | null,
  },

  observers: {
    "theme, size, block, shape, disabled, loading, variant, ghost"() {
      this.setClass();
    },

    icon(icon: unknown) {
      this.setData({
        _icon: calcIcon(icon, ""),
      });
    },
  },

  lifetimes: {
    attached() {
      this.setClass();
    },
  },

  methods: {
    setClass() {
      const classList = [
        name,
        `${prefix}-class`,
        `${name}--${this.data.variant || "base"}`,
        `${name}--${this.data.theme || "default"}`,
        `${name}--${this.data.shape || "rectangle"}`,
        `${name}--size-${this.data.size || "medium"}`,
      ];

      if (this.data.block) {
        classList.push(`${name}--block`);
      }
      if (this.data.disabled) {
        classList.push(`${name}--disabled`);
      }
      if (this.data.ghost) {
        classList.push(`${name}--ghost`);
      }

      this.setData({
        className: classList.join(" "),
      });
    },

    getuserinfo(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("getuserinfo", event.detail);
    },

    contact(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("contact", event.detail);
    },

    createliveactivity(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("createliveactivity", event.detail);
    },

    getphonenumber(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("getphonenumber", event.detail);
    },

    getrealtimephonenumber(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("getrealtimephonenumber", event.detail);
    },

    error(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("error", event.detail);
    },

    opensetting(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("opensetting", event.detail);
    },

    launchapp(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("launchapp", event.detail);
    },

    chooseavatar(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("chooseavatar", event.detail);
    },

    agreeprivacyauthorization(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("agreeprivacyauthorization", event.detail);
    },

    phoneoneclicklogin(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("phoneoneclicklogin", event.detail);
    },

    handleTap(event: WechatMiniprogram.CustomEvent) {
      if (this.data.disabled || this.data.loading) return;

      this.triggerEvent("tap", event);
    },
  },
});
