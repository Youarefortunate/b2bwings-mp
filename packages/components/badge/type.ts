export type BadgeCount = string | number | null;

export type BadgeOffset = Array<string | number>;

export type BadgeShape =
  | "circle"
  | "square"
  | "bubble"
  | "ribbon"
  | "ribbon-right"
  | "ribbon-left"
  | "triangle-right"
  | "triangle-left";

export type BadgeSize = "medium" | "large";

export interface BadgeProps {
  /**
   * 徽标颜色
   * @default ''
   */
  color?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 徽标包裹内容，未传入时渲染默认插槽
   * @default ''
   */
  content?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 徽标内容，传入 null 时使用 count 插槽
   * @default 0
   */
  count?: {
    type: null;
    value?: BadgeCount;
  };
  /**
   * 是否为红点徽标
   * @default false
   */
  dot?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 数字封顶值
   * @default 99
   */
  maxCount?: {
    type: NumberConstructor;
    value?: number;
  };
  /**
   * 徽标位置偏移
   */
  offset?: {
    type: ArrayConstructor;
    value?: BadgeOffset;
  };
  /**
   * 徽标形状
   * @default circle
   */
  shape?: {
    type: StringConstructor;
    value?: BadgeShape;
  };
  /**
   * count 为 0 时是否显示徽标
   * @default false
   */
  showZero?: {
    type: BooleanConstructor;
    value?: boolean;
  };
  /**
   * 徽标尺寸
   * @default medium
   */
  size?: {
    type: StringConstructor;
    value?: BadgeSize;
  };
}
