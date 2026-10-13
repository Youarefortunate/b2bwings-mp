import { createComponent } from "../common/component/index";
import { config } from "../common/index";
import { tabItemProps } from "./props";
import type { TabItemParent } from "./type";

const { prefix } = config;
const name = `${prefix}-tab-item`;

createComponent({
  options: {
    multipleSlots: true,
  },

  externalClasses: [`${prefix}-class`],

  // 关联父组件 tabs
  relations: {
    "../tabs/tabs": {
      type: "ancestor",
    },
  },

  properties: {
    ...tabItemProps(),
  },

  data: {
    prefix,
    classPrefix: name,
    active: false,
    hide: true,
    id: "",
    hasActivated: false,
  },

  observers: {
    // 监听属性变化，发生改变时主动通知父组件 tabs 更新选项卡状态
    "label, badgeProps, disabled, icon, panel, value, lazy"() {
      this.update();
    },
  },

  methods: {
    setId(id: string) {
      this.setData({ id });
    },

    getComputedName() {
      if (this.properties.value != null) {
        return `${this.properties.value}`;
      }

      return `${this.index}`;
    },

    // 通知父组件 tabs 重新计算并渲染选项卡
    update() {
      const parent = this.getRelationNodes("../tabs/tabs")[0] as TabItemParent;
      parent?.updateTabs?.();
    },

    /**
     * 渲染当前选项卡面板的激活状态
     * @param active 是否激活
     * @param parent 父组件 tabs 实例
     */
    render(active: boolean, parent: TabItemParent) {
      this.initialized = this.initialized || active;

      if (active && !this.data.hasActivated) {
        this.setData({ hasActivated: true });
      }

      this.setData({
        active,
        hide: !parent.data.animation && !active,
      });
    },
  },
});
