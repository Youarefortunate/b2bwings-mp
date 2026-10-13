import { createComponent } from "../common/component/index";
import { config, getRect, uniqueFactory } from "../common/index";
import { badgeProps } from "./props";

const { prefix } = config;
const name = `${prefix}-badge`;
const getUniqueID = uniqueFactory("badge");

createComponent({
  options: {
    multipleSlots: true,
  },

  externalClasses: [
    `${prefix}-class`,
    `${prefix}-class-count`,
    `${prefix}-class-content`,
  ],

  properties: {
    ...badgeProps(),
  },

  data: {
    prefix,
    classPrefix: name,
    labelID: "",
    descriptionID: "",
    useOuterClass: false,
  },

  observers: {
    "content, shape"() {
      this.checkForActualContent();
    },
  },

  lifetimes: {
    ready() {
      const uniqueID = getUniqueID();

      this.setData({
        labelID: `${uniqueID}_label`,
        descriptionID: `${uniqueID}_description`,
      });

      this.checkForActualContent();
    },
  },

  methods: {
    checkForActualContent() {
      const target = [
        "ribbon",
        "ribbon-right",
        "ribbon-left",
        "triangle-right",
        "triangle-left",
      ];

      if (this.data.content || !target.includes(this.data?.shape || "")) {
        this.setData({ useOuterClass: false });
        return;
      }

      getRect(this, `.${name}__content`).then(
        (rect: WechatMiniprogram.BoundingClientRectCallbackResult) => {
          const hasSlotContent = rect.width > 0 || rect.height > 0;
          this.setData({ useOuterClass: !hasSlotContent });
        },
      );
    },
  },
});
