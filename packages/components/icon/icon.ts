import { createComponent } from "../common/component/index";
import { config, styles, addUnit, getRect } from "../common/index";
import { hasWxImageExtension } from "../common/utils/image";
import { iconProps } from "./props";

const { prefix } = config;
const name = `${prefix}-icon`;

createComponent({
  externalClasses: [
    `${prefix}-class`, // 根节点外部样式类
  ],

  properties: {
    ...iconProps(),
  },

  data: {
    componentPrefix: prefix,
    classPrefix: name,
    isImage: false,
    iconStyle: "",
  },

  observers: {
    "name, color, size, style"() {
      this.setIconStyle();
    },
  },

  methods: {
    onTap(event: WechatMiniprogram.CustomEvent) {
      this.triggerEvent("click", event.detail);
    },

    isImageIconName(name: string) {
      if (!name) {
        return false;
      }

      const isHttpImage = /^https?:\/\//.test(name);
      const isAbsoluteImage = /^\//.test(name);
      const isRelativeImage = /^\.\.?\//.test(name);

      return (
        (isHttpImage || isAbsoluteImage || isRelativeImage) &&
        hasWxImageExtension(name)
      );
    },

    setIconStyle() {
      const { name, color, size, classPrefix } = this.data;
      const isImage = this.isImageIconName(name);

      const sizeValue =
        size !== null && size !== "" ? addUnit(size) : undefined;
      const colorStyle = color ? { color: color } : {};
      const fontStyle = size ? { "font-size": sizeValue } : {};
      const iconStyle: Record<string, string | number | undefined> = {
        ...colorStyle,
        ...fontStyle,
      };

      this.setData({ isImage }, async () => {
        if (isImage) {
          let iconSize = sizeValue;
          if (!iconSize) {
            await getRect(this, `.${classPrefix}`)
              .then(
                (res: WechatMiniprogram.BoundingClientRectCallbackResult) => {
                  iconSize = addUnit(res?.height);
                  iconStyle.width = iconSize;
                  iconStyle.height = iconSize;
                  this.setData({ iconStyle: `${styles(iconStyle)}` });
                },
              )
              .catch(() => {});
            return;
          }

          iconStyle.width = iconSize;
          iconStyle.height = iconSize;
        }
        this.setData({ iconStyle: `${styles(iconStyle)}` });
      });
    },
  },
});
