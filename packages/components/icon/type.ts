export interface IconProps {
  /**
   * 图标颜色
   * @default ''
   */
  color?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 图标名称或图片链接
   * @default ''
   */
  name: {
    type: StringConstructor;
    value?: string;
    required?: boolean;
  };
  /**
   * 自定义图标前缀
   * @default ''
   */
  prefix?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 图标大小
   */
  size?: {
    type: null;
    value?: string | number;
  };
}
