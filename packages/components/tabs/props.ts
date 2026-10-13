import type { TabsProps } from "./type";

/** Tabs 属性配置 */
export const tabsProps = (): TabsProps => ({
  /** 动画效果设置，其中 duration 表示动画时长，单位秒 */
  animation: {
    type: Object,
    value: {},
  },
  /** 激活下划线的模式 */
  bottomLineMode: {
    type: String,
    value: "fixed",
  },
  /** 是否展示底部激活线条 */
  showBottomLine: {
    type: Boolean,
    value: true,
  },
  /** 选项卡头部空间是否均分 */
  spaceEvenly: {
    type: Boolean,
    value: true,
  },
  /** 是否展示分割线 */
  split: {
    type: Boolean,
    value: true,
  },
  /** 是否开启粘性布局 */
  sticky: {
    type: Boolean,
    value: false,
  },
  /** 透传至 Sticky 组件 */
  stickyProps: {
    type: Object,
    value: {},
  },
  /** 是否可以滑动切换 */
  swipeable: {
    type: Boolean,
    value: true,
  },
  /** 标签的样式 */
  theme: {
    type: String,
    value: "line",
  },
  /** 激活的选项卡值 */
  value: {
    type: null,
    value: null,
  },
  /** 激活的选项卡默认值，非受控属性 */
  defaultValue: {
    type: null,
  },
  /** 是否开启神奇过渡效果 */
  magical: {
    type: Boolean,
    value: false,
  },
});
