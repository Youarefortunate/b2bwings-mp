import { createComponent } from "../common/component/index";
import { config, getRect, unitConvert } from "../common/index";
import { pageScrollBehavior } from "../common/behaviors/index";
import { stickyProps } from "./props";

const { prefix } = config;
const name = `${prefix}-sticky`;
const ContainerClass = `.${name}`;

createComponent({
  externalClasses: [`${prefix}-class`, `${prefix}-class-content`],

  properties: {
    ...stickyProps(),
  },

  behaviors: [pageScrollBehavior()],

  observers: {
    "offsetTop, disabled, container"() {
      this.onScroll();
    },
  },

  data: {
    prefix,
    classPrefix: name,
    containerStyle: "",
    contentStyle: "",
  },

  lifetimes: {
    ready() {
      this.onScroll();
    },
  },

  methods: {
    onScroll(event?: WechatMiniprogram.Page.IPageScrollOption) {
      const { scrollTop } = event || {};
      const { container, offsetTop, disabled } = this.properties;

      if (disabled) {
        this.setDataAfterDiff({
          isFixed: false,
          transform: 0,
        });
        return;
      }

      const offsetTopPx = unitConvert(offsetTop);
      this.scrollTop = scrollTop || (this as any).scrollTop || 0;

      if (typeof container === "function") {
        Promise.all([
          getRect(this, ContainerClass),
          this.getContainerRect(),
        ]).then(([root, containerNode]) => {
          if (!root || !containerNode) return;
          if (
            offsetTopPx + root.height >
            containerNode.height + containerNode.top
          ) {
            this.setDataAfterDiff({
              isFixed: false,
              transform: containerNode.height - root.height,
            });
          } else if (offsetTopPx >= root.top) {
            this.setDataAfterDiff({
              isFixed: true,
              height: root.height,
              transform: 0,
            });
          } else {
            this.setDataAfterDiff({ isFixed: false, transform: 0 });
          }
        });

        return;
      }

      getRect(this, ContainerClass).then((root) => {
        if (!root) return;
        if (offsetTopPx >= root.top) {
          this.setDataAfterDiff({ isFixed: true, height: root.height });
          (this as any).transform = 0;
        } else {
          this.setDataAfterDiff({ isFixed: false });
        }
      });
    },

    setDataAfterDiff(data: {
      isFixed: boolean;
      height?: number;
      transform?: number;
    }) {
      const { offsetTop } = this.properties;
      const {
        containerStyle: prevContainerStyle,
        contentStyle: prevContentStyle,
      } = this.data;
      const { isFixed, height, transform } = data;
      const offsetTopPx = unitConvert(offsetTop);

      wx.nextTick(() => {
        let containerStyle = "";
        let contentStyle = "";

        if (isFixed) {
          containerStyle += `height:${height}px;`;
          contentStyle += `position:fixed;top:${offsetTopPx}px;left:0;right:0;`;
        }
        if (transform) {
          const translate = `translate3d(0, ${transform}px, 0)`;
          contentStyle += `-webkit-transform:${translate};transform:${translate};`;
        }

        if (
          prevContainerStyle !== containerStyle ||
          prevContentStyle !== contentStyle
        ) {
          this.setData({ containerStyle, contentStyle });
        }

        this.triggerEvent("scroll", {
          scrollTop: this.scrollTop,
          isFixed,
        });
      });
    },

    getContainerRect() {
      const nodesRef = this.properties.container?.();
      return new Promise<WechatMiniprogram.BoundingClientRectCallbackResult>(
        (resolve) => nodesRef?.boundingClientRect(resolve).exec(),
      );
    },
  },
});
