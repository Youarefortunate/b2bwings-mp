export interface EmptyProps {
  /**
   * 描述文字
   */
  description?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 图标名称或图标配置
   */
  icon?: {
    type: null;
    value?: string | Record<string, unknown>;
  };
  /**
   * 图片地址
   */
  image?: {
    type: StringConstructor;
    value?: string;
  };
}
