import { createComponent } from "../common/component/index";
import { config, getObserver, getRect, uniqueFactory } from "../common/index";
import { tabsProps } from "./props";
import type {
  TabBottomLineMode,
  TabItem,
  TabItemInstance,
  TouchState,
} from "./type";

const { prefix } = config;
const name = `${prefix}-tabs`;
const getUniqueID = uniqueFactory("tabs");

createComponent({
  options: {
    // 详情：https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/pure-data.html
    pureDataPattern: /^currentLabels$/,
  },

  externalClasses: [
    `${prefix}-class`,
    `${prefix}-class-item`,
    `${prefix}-class-active`,
    `${prefix}-class-track`,
    `${prefix}-class-content`,
  ],

  // 详情：https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/relations.html
  relations: {
    "../tab-item/tab-item": {
      type: "descendant",
      linked(target: TabItemInstance) {
        this.children = this.children || [];
        this.children.push(target);
        this.initChildId();
        target.index = this.children.length - 1;
        this.updateTabs();
      },
      unlinked(target: TabItemInstance) {
        this.children = (this.children || []).filter(
          (item: TabItemInstance) => item.index !== target.index,
        );
        this.updateTabs(() => this.setTrack());
        this.initChildId();
      },
    },
  },

  properties: {
    ...tabsProps(),
  },

  /**
   * 受控属性配置
   * 外部使用示例：`<xbd-tabs value="{{ xxxx }}" bind:change="onChange">`
   * 声明受控属性后，框架会自动将对应的属性和变更事件进行联动同步
   */
  controlledProps: [{ key: "value", event: "change" }],

  observers: {
    // 当受控 value 属性改变时，同步更新内部选中的 currentIndex 索引
    value(value: string | number) {
      if (`${value}` !== this.getCurrentName()) {
        this.setCurrentIndexByName(value);
      }
    },
  },

  data: {
    prefix,
    classPrefix: name,
    tabs: [] as TabItem[],
    currentLabels: [] as string[],
    currentIndex: -1,
    trackOption: { lineWidth: 0, distance: 0, isInit: true },
    animating: false,
    trackDirection: "",
    offset: 0,
    scrollLeft: 0,
    tabID: "",
    placement: "top",
  },

  lifetimes: {
    created() {
      this.children = this.children || [];
    },

    attached() {
      wx.nextTick(() => {
        this.setTrack();
      });
      getRect(this, `.${name}`).then((rect) => {
        this.containerWidth = rect.width;
      });
      this.setData(
        {
          tabID: getUniqueID(),
        },
        () => {
          this.initChildId();
        },
      );
    },

    detached() {
      const self = this as any;
      if (self._animTimer) {
        clearTimeout(self._animTimer);
      }
    },
  },

  methods: {
    initChildId() {
      this.children?.forEach((item: TabItemInstance, index: number) => {
        item.setId(`${this.data.tabID}_panel_${index}`);
      });
    },

    onScroll(event: WechatMiniprogram.CustomEvent<{ scrollLeft: number }>) {
      this.setData({
        scrollLeft: event.detail.scrollLeft,
      });
    },

    /**
     * 收集所有子组件 tab-item 的配置信息
     * @param cb 状态更新完成后的回调函数
     */
    updateTabs(cb?: () => void) {
      const tabs = (this.children || []).map((child: TabItemInstance) => {
        const badgeProps = child.data.badgeProps || {};

        return {
          ...child.data,
          badgeProps,
          hasBadge: Boolean(badgeProps.dot || badgeProps.count),
          icon:
            typeof child.data.icon === "string"
              ? { name: child.data.icon }
              : child.data.icon,
        };
      });

      this.setData({ tabs }, cb);
      this.setCurrentIndexByName(this.properties.value);
    },

    /**
     * 根据选项卡的值 (value) 匹配对应的子选项卡并设置为当前激活状态
     * @param value 选中的选项卡值
     */
    setCurrentIndexByName(value: string | number) {
      const index = (this.children || []).findIndex(
        (child: TabItemInstance) => child.getComputedName() === `${value}`,
      );
      if (index > -1) {
        this.setCurrentIndex(index);
      }
    },

    /**
     * 根据索引值设置当前激活的选项卡，通知子组件进行显隐渲染，并触发滑块位置重新计算
     * @param index 目标选项卡索引
     */
    setCurrentIndex(index: number) {
      if (index <= -1 || index >= (this.children || []).length) return;

      const labels: string[] = [];
      this.children.forEach((child: TabItemInstance, idx: number) => {
        const isActive = index === idx;
        if (isActive !== child.data.active || !child.initialized) {
          child.render(isActive, this);
        }
        if (this.data.animation && idx <= index && !child.data.hasActivated) {
          child.setData({ hasActivated: true });
        }
        labels.push(`${child.data.label || ""}`);
      });

      if (
        this.data.currentIndex === index &&
        this.data.currentLabels.join("") === labels.join("")
      ) {
        return;
      }

      this.setData(
        {
          currentIndex: index,
          currentLabels: labels,
        },
        () => {
          this.setTrack();
        },
      );
    },

    getCurrentName() {
      const activeTab = this.children?.[
        this.data.currentIndex
      ] as TabItemInstance;

      return activeTab?.getComputedName();
    },

    /**
     * 计算滚动条偏移量，实现当前选中的选项卡自动滚动居中对齐
     * @param containerWidth tabs 容器的可见宽度
     * @param targetLeft 选中项相对于 tabs 容器左侧的位移
     * @param targetWidth 选中项的宽度
     * @param offset 当前已滚动的左侧偏移量
     */
    calcScrollOffset(
      containerWidth: number,
      targetLeft: number,
      targetWidth: number,
      offset: number,
    ) {
      return offset + targetLeft - containerWidth / 2 + targetWidth / 2;
    },

    getTabHeight() {
      return getRect(this, `.${name}`);
    },

    /**
     * 获取滑块宽度，支持根据 bottomLineMode 自适应匹配
     */
    getTrackSize() {
      const targetMap: Record<"fixed" | "auto" | "full", string> = {
        fixed: `.${prefix}-tabs__track`,
        auto: `.${prefix}-tabs__item--active .${prefix}-tabs__item-inner`,
        full: `.${prefix}-tabs__item--active`,
      };
      const bottomLineMode = (this.properties.bottomLineMode ||
        "fixed") as TabBottomLineMode;

      return new Promise<number>((resolve, reject) => {
        if (this.trackWidth) {
          resolve(this.trackWidth);
          return;
        }
        getRect(this, targetMap[bottomLineMode])
          .then((res) => {
            if (res) resolve(res.width);
          })
          .catch(reject);
      });
    },

    /**
     * 核心滑块位移与动画计算逻辑
     * 计算滑块在 line 主题下的平移距离 (distance) 与宽度 (lineWidth)
     * 同时根据选中项位置自动调整滚动条的偏移量 (scrollLeft) 确保选中项居中
     */
    async setTrack() {
      if (!this.children?.length || this.data.currentIndex <= -1) return;

      try {
        const rects = await getRect(this, `.${prefix}-tabs__item`, true);
        const rect = rects[this.data.currentIndex];
        if (!rect) return;

        let distance = 0;
        let totalSize = 0;
        rects.forEach(
          (
            item: WechatMiniprogram.BoundingClientRectCallbackResult,
            index: number,
          ) => {
            if (index < this.data.currentIndex) distance += item.width;
            totalSize += item.width;
          },
        );

        if (this.containerWidth) {
          const offset = this.calcScrollOffset(
            this.containerWidth,
            rect.left,
            rect.width,
            this.data.scrollLeft,
          );
          const maxOffset = totalSize - this.containerWidth;
          this.setData({ offset: Math.min(Math.max(offset, 0), maxOffset) });
        } else if (!this._hasObserved) {
          this._hasObserved = true;
          getObserver(this, `.${name}`).then(() => this.setTrack());
        }

        let lineWidth = await this.getTrackSize();
        if (this.data.theme === "line") {
          distance += (rect.width - lineWidth) / 2;
        } else if (this.data.theme === "segment") {
          lineWidth = rect.width;
        }

        const isInit = this.previousIndex === undefined;
        if (isInit || this.previousIndex !== this.data.currentIndex) {
          const prevIndex = this.previousIndex;
          this.previousIndex = this.data.currentIndex;

          // TODO: 待定神奇效果，后续可能移除。调用滑块 3D 变形动画逻辑
          this.setMagicalTrackAnimation(prevIndex, this.data.currentIndex);

          this.setData({ trackOption: { lineWidth, distance, isInit } });
        }
      } catch (error) {
        this.triggerEvent("error", error);
      }
    },

    // TODO: 待定神奇效果，后续可能移除。用于触发分段器主题下的滑块 3D 精灵吸瓶变形动画逻辑
    setMagicalTrackAnimation(
      prevIndex: number | undefined,
      currentIndex: number,
    ) {
      if (!this.properties.magical) return;

      let slideDirection = "";
      if (prevIndex !== undefined && currentIndex !== prevIndex) {
        slideDirection = currentIndex > prevIndex ? "right" : "left";
      }

      if (slideDirection) {
        const self = this as any;
        if (self._animTimer) {
          clearTimeout(self._animTimer);
        }
        this.setData({
          trackDirection: slideDirection,
          animating: true,
        });
        self._animTimer = setTimeout(() => {
          this.setData({
            animating: false,
            trackDirection: "",
          });
        }, 520);
      }
    },

    onTabTap(event: WechatMiniprogram.TouchEvent) {
      this.changeIndex(Number(event.currentTarget.dataset.index));
    },

    // 滑动切换手势逻辑 - 记录触摸起始坐标
    onTouchStart(event: WechatMiniprogram.TouchEvent) {
      if (!this.properties.swipeable) return;
      const touch = event.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.deltaX = 0;
      this.offsetX = 0;
      this.direction = undefined;
    },

    // 滑动切换手势逻辑 - 计算移动偏移并判定滑动方向为水平或垂直
    onTouchMove(event: WechatMiniprogram.TouchEvent) {
      if (!this.properties.swipeable) return;
      const touch = event.touches[0];
      const state = this as TouchState;
      state.deltaX = touch.clientX - (state.startX || 0);
      const deltaY = touch.clientY - (state.startY || 0);
      state.offsetX = Math.abs(state.deltaX);
      if (!state.direction) {
        state.direction =
          state.offsetX > Math.abs(deltaY) ? "horizontal" : "vertical";
      }
    },

    // 滑动切换手势逻辑 - 触摸结束时判断滑动距离是否达标，达标则触发切换
    onTouchEnd() {
      if (!this.properties.swipeable) return;
      const state = this as TouchState;
      if (state.direction === "horizontal" && (state.offsetX || 0) >= 50) {
        const index = this.getAvailableTabIndex(state.deltaX || 0);
        if (index !== -1) {
          this.changeIndex(index);
        }
      }
    },

    onTouchScroll(event: WechatMiniprogram.CustomEvent) {
      this._trigger("scroll", event.detail);
    },

    changeIndex(index: number) {
      const currentTab = this.data.tabs[index];
      if (!currentTab) return;

      const { value, label } = currentTab;
      if (!currentTab.disabled && index !== this.data.currentIndex) {
        this._trigger("change", { value, label });
      }
      this._trigger("click", { value, label });
    },

    /**
     * 获取下一个可切换的有效选项卡索引，自动跳过被禁用的选项卡
     * @param deltaX 手势滑动的横向距离，正数代表向右划（选择左侧 Tab），负数代表向左划（选择右侧 Tab）
     */
    getAvailableTabIndex(deltaX: number) {
      const step = deltaX > 0 ? -1 : 1;
      const { currentIndex, tabs } = this.data;
      const len = tabs.length;

      for (
        let i = step;
        currentIndex + i >= 0 && currentIndex + i < len;
        i += step
      ) {
        const newIndex = currentIndex + i;
        if (tabs[newIndex] && !tabs[newIndex].disabled) {
          return newIndex;
        }
      }

      return -1;
    },
  },
});
