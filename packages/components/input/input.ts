import { createComponent } from "../common/component/index";
import { config, getCharacterLength, calcIcon, isDef } from "../common/index";
import { inputProps } from "./props";
import { InputValue } from "./type";

const { prefix } = config;
const name = `${prefix}-input`;

createComponent({
  options: {
    multipleSlots: true,
  },

  externalClasses: [
    `${prefix}-class`,
    `${prefix}-class-prefix-icon`,
    `${prefix}-class-label`,
    `${prefix}-class-input`,
    `${prefix}-class-clearable`,
    `${prefix}-class-suffix`,
    `${prefix}-class-suffix-icon`,
    `${prefix}-class-tips`,
  ],

  // 说明：https://developers.weixin.qq.com/miniprogram/dev/component/form.html
  behaviors: ["wx://form-field"],

  properties: {
    ...inputProps(),
  },

  data: {
    prefix,
    classPrefix: name,
    classBasePrefix: prefix,
    showClearIcon: true,
  },

  lifetimes: {
    ready() {
      const { value, defaultValue } = this.properties;
      this.updateValue(value ?? defaultValue ?? "");
    },
  },

  observers: {
    prefixIcon(v) {
      this.setData({
        _prefixIcon: calcIcon(v),
      });
    },

    suffixIcon(v) {
      this.setData({
        _suffixIcon: calcIcon(v),
      });
    },

    clearable(v) {
      this.setData({
        _clearIcon: calcIcon(v, "close-circle-fill"),
      });
    },

    "clearTrigger, clearable, disabled, readonly"() {
      this.updateClearIconVisible();
    },
  },

  methods: {
    updateValue(value: InputValue | null | undefined) {
      const { allowInputOverMax, maxcharacter, maxlength } = this.properties;
      if (
        !allowInputOverMax &&
        maxcharacter &&
        maxcharacter > 0 &&
        !Number.isNaN(maxcharacter)
      ) {
        const { length, characters } = getCharacterLength(
          "maxcharacter",
          value ?? "",
          maxcharacter,
        );
        this.setData({
          value: characters,
          count: length,
        });
      } else if (
        !allowInputOverMax &&
        maxlength &&
        maxlength > 0 &&
        !Number.isNaN(maxlength)
      ) {
        const { length, characters } = getCharacterLength(
          "maxlength",
          value ?? "",
          maxlength,
        );
        this.setData({
          value: characters,
          count: length,
        });
      } else {
        this.setData({
          value,
          count: isDef(value) ? String(value).length : 0,
        });
      }
    },

    updateClearIconVisible(value: boolean = false) {
      const { clearTrigger, disabled, readonly } = this.properties;
      if (disabled || readonly) {
        this.setData({ showClearIcon: false });
        return;
      }
      this.setData({ showClearIcon: value || clearTrigger === "always" });
    },

    onInput(e: WechatMiniprogram.Input) {
      const { value, cursor, keyCode } = e.detail;
      this.updateValue(value);
      this.triggerEvent("change", { value: this.data.value, cursor, keyCode });
    },

    onChange(e: WechatMiniprogram.Input) {
      if (this.properties.type !== "nickname") return;
      const { value } = e.detail;
      this.updateValue(value);
      this.triggerEvent("change", { value: this.data.value });
    },

    onFocus(e: WechatMiniprogram.InputFocus) {
      this.updateClearIconVisible(true);
      this.triggerEvent("focus", e.detail);
    },

    onBlur(e: WechatMiniprogram.InputBlur) {
      this.updateClearIconVisible();

      // 失焦时处理 format
      if (typeof this.properties.format === "function") {
        const v = this.properties.format(e.detail.value);
        this.updateValue(v);
        this.triggerEvent("blur", {
          value: this.data.value,
          cursor: this.data.count,
        });
        return;
      }
      this.triggerEvent("blur", e.detail);
    },

    onConfirm(e: WechatMiniprogram.InputConfirm) {
      this.triggerEvent("enter", e.detail);
    },

    onSuffixClick() {
      this.triggerEvent("click", { trigger: "suffix" });
    },

    onSuffixIconClick() {
      this.triggerEvent("click", { trigger: "suffix-icon" });
    },

    clearInput(e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("clear", e.detail);
      this.setData({ value: "" });
    },

    onKeyboardHeightChange(e: WechatMiniprogram.InputKeyboardHeightChange) {
      this.triggerEvent("keyboardheightchange", e.detail);
    },

    onNickNameReview(e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("nicknamereview", e.detail);
    },
  },
});
