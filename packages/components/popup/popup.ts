import { createComponent } from "../common/component/index";
import { config } from "../common/index";
import {
  transitionBehavior,
  useCustomNavbarBehavior,
} from "../common/behaviors/index";
import { popupProps } from "./props";

const { prefix } = config;
const name = `${prefix}-popup`;

createComponent({
  externalClasses: [
    `${prefix}-class`,
    `${prefix}-class-content`,
    `${prefix}-class-header`,
    `${prefix}-class-header-body`,
    `${prefix}-class-header-title`,
    `${prefix}-class-header-subtitle`,
    `${prefix}-class-header-close`,
  ],

  behaviors: [transitionBehavior(), useCustomNavbarBehavior()],

  properties: {
    ...popupProps(),
  },

  controlledProps: [{ key: "visible", event: "visible-change" }],

  observers: {
    duration(duration: number) {
      this.setData({
        transitionDuration: duration || 240,
      });
    },
  },

  data: {
    prefix,
    classPrefix: name,
    name: "fade",
    transitionDuration: 240,
  },

  lifetimes: {
    attached() {
      this.setData({
        transitionDuration: this.properties.duration || 240,
      });
    },
  },

  methods: {
    handleOverlayClick() {
      if (!this.properties.closeOnOverlayClick) return;

      this._trigger("visible-change", {
        visible: false,
        trigger: "overlay",
      });
    },

    handleClose() {
      this._trigger("visible-change", {
        visible: false,
        trigger: "close-btn",
      });
    },
  },
});
