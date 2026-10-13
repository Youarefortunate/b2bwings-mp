/**
 * 组件公共属性 Behavior
 */
export default () =>
  Behavior({
    properties: {
      /** 样式字符串 */
      style: {
        type: String,
        value: "",
      },
      /** 自定义样式字符串 */
      customStyle: {
        type: String,
        value: "",
      },
      /** 是否对无障碍树隐藏 */
      ariaHidden: {
        type: Boolean,
      },
      /** 无障碍角色 */
      ariaRole: {
        type: String,
      },
      /** 无障碍标签 */
      ariaLabel: {
        type: String,
      },
      /** 无障碍标签关联元素 */
      ariaLabelledby: {
        type: String,
      },
      /** 无障碍描述关联元素 */
      ariaDescribedby: {
        type: String,
      },
      /** 是否处于无障碍繁忙状态 */
      ariaBusy: {
        type: Boolean,
      },
    },
  });
