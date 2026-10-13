import { systemInfo } from "../utils/helper";

export default () =>
  Behavior({
    properties: {
      /** 是否使用自定义导航栏 */
      usingCustomNavbar: {
        type: Boolean,
        value: false,
      },
      /** 自定义导航栏高度 */
      customNavbarHeight: {
        type: Number,
        value: 0,
      },
    },
    data: {
      distanceTop: 0,
    },

    lifetimes: {
      attached() {
        if (this.properties.usingCustomNavbar) {
          this.calculateCustomNavbarDistanceTop();
        }
      },
    },

    methods: {
      calculateCustomNavbarDistanceTop() {
        const { statusBarHeight } = systemInfo;
        const menuButton = wx.getMenuButtonBoundingClientRect();
        const distance = menuButton.top + menuButton.bottom - statusBarHeight;

        this.setData({
          distanceTop: Math.max(
            distance,
            this.properties.customNavbarHeight + statusBarHeight,
          ),
        });
      },
    },
  });
