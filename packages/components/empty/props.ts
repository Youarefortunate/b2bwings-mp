import { EmptyProps } from "./type";

export const emptyProps = (): EmptyProps => ({
  /** 描述文字 */
  description: {
    type: String,
  },
  /** 图标名称或图标配置 */
  icon: {
    type: null,
  },
  /** 图片地址 */
  image: {
    type: String,
  },
});
