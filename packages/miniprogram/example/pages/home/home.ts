import list from "./data/index";

Page({
  data: {
    list: [] as any[],
    viewMode: "grid", // 预览模式: list 或 grid
    isSticky: false, // 是否吸顶状态
    tabsWidth: "auto", // 自适应选项卡真实宽度
  },

  _stickyObserver: null as any,

  onLoad(options) {
    const { q } = options;

    this.setData({
      list,
    });

    if (q) {
      const str = this.getQueryByUrl(decodeURIComponent(q));
      wx.navigateTo({
        url: `/pages/${str.page}/${str.page}`,
      });
    }
  },

  onReady() {
    this.initStickyObserver();
    // 在首次渲染完成后测量选项卡依靠内容撑开的真实宽度，用来进行 width 的 transition 插值动画
    wx.nextTick(() => {
      wx.createSelectorQuery()
        .select(".home-page__tabs")
        .boundingClientRect((rect: any) => {
          if (rect && rect.width) {
            this.setData({
              tabsWidth: `${rect.width}px`,
            });
          }
        })
        .exec();
    });
  },

  onUnload() {
    if (this._stickyObserver) {
      this._stickyObserver.disconnect();
    }
  },

  initStickyObserver() {
    this._stickyObserver = wx.createIntersectionObserver(null as any);
    // 监听锚点相对于视口顶部的相交状态
    this._stickyObserver
      .relativeToViewport({ top: 0 })
      .observe(".home-page__sticky-anchor", (res: any) => {
        const isSticky = res.boundingClientRect.top < 0;
        this.setData(
          {
            isSticky,
          },
          () => {
            // 在 wx.nextTick 中进行首次计算，避开 DOM 尺寸更新延迟
            wx.nextTick(() => {
              const tabs = this.selectComponent("#homeTabs");
              if (tabs) {
                tabs.previousIndex = undefined; // 绕过组件内部 currentIndex 防抖拦截，强制更新滑块
                tabs.containerWidth = 0;
                tabs.setTrack();

                // 待 350ms CSS 宽度过渡动画彻底完成后进行最终精准对准
                setTimeout(() => {
                  tabs.previousIndex = undefined;
                  tabs.containerWidth = 0;
                  tabs.setTrack();
                }, 380);
              }
            });
          },
        );
      });
  },

  onTabsChange(e: any) {
    const { value } = e.detail;
    this.setData({
      viewMode: value,
    });
  },

  onCardTap(e: any) {
    const { item } = e.detail;
    this.clickHandle({ detail: { item } });
  },

  clickHandle(e: any) {
    if (!e.detail) {
      console.error("clickHandle: e.detail is undefined", e);
      return;
    }

    const { item } = e.detail;
    if (!item) {
      console.error("clickHandle: item is undefined", e.detail);
      return;
    }

    let { name, path = "" } = item as {
      name: string;
      path?: string;
    };

    if (!name) {
      console.error("clickHandle: name is undefined", e.detail.item);
      return;
    }

    if (!path) {
      name = name.replace(/^[A-Z]/, (match) => `${match}`.toLocaleLowerCase());
      name = name.replace(/[A-Z]/g, (match) => {
        return `-${match.toLowerCase()}`;
      });

      path = `/pages/${name}/${name}`;
    }

    wx.navigateTo({
      url: path,
      fail: () => {
        wx.navigateTo({
          url: "/pages/home/navigateFail/navigateFail",
        });
      },
    });
  },

  onShareAppMessage() {
    return {
      title: "B2B Wings UI",
      path: "/pages/home/home",
    };
  },

  getQueryByUrl(url: string) {
    const data: Record<string, any> = {};
    const queryArr = `${url}`.match(/([^=&#?]+)=[^&#]+/g) || [];
    if (queryArr.length) {
      queryArr.forEach((para) => {
        const d = para.split("=");
        const val = decodeURIComponent(d[1]);
        if (data[d[0]] !== undefined) {
          data[d[0]] += `,${val}`;
        } else {
          data[d[0]] = val;
        }
      });
    }
    return data;
  },
});
