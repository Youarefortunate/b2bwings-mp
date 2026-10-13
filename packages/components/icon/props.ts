import { IconProps } from "./type";

export const iconProps = (): IconProps => ({
  /** 图标颜色 */
  color: {
    type: String,
    value: "",
  },
  /** 图标名称或图片链接 */
  name: {
    type: String,
    value: "",
    required: true,
  },
  /** 自定义图标前缀 */
  prefix: {
    type: String,
    value: "",
  },
  /** 图标大小，如 '20', '20px', '48rpx' */
  size: {
    type: null,
  },
});
