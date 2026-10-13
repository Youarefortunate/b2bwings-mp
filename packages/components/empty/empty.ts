import { createComponent } from "../common/component/index";
import { config, setIcon } from "../common/index";
import { emptyProps } from "./props";

const { prefix } = config;
const name = `${prefix}-empty`;

createComponent({
  options: {
    multipleSlots: true,
  },

  externalClasses: [
    `${prefix}-class`,
    `${prefix}-class-description`,
    `${prefix}-class-image`,
    `${prefix}-class-actions`,
  ],

  properties: {
    ...emptyProps(),
  },

  data: {
    prefix,
    classPrefix: name,
    iconName: "",
    iconData: {},
  },

  observers: {
    icon(icon: unknown) {
      this.setData({
        ...setIcon("icon", icon, ""),
      });
    },
  },
});
