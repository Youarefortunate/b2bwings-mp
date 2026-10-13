/** 受控属性配置 Options */
export interface ControlledPropOption {
  /** 受控属性名 */
  key: string;
  /** 触发变更的事件名 */
  event: string;
}

/** 受控组件自定义 Component 实例的额外属性 */
export interface ControlledCustomInstanceProperty {
  /** 当前组件是否处于受控状态 */
  _selfControlled?: boolean;
  /** 统一受控事件触发入口，非受控模式下先同步内部值 */
  _trigger: WechatMiniprogram.Component.TrivialInstance["triggerEvent"];
}

/**
 * Component 构造器的 options
 */
export type ComponentOptions<
  TProperty extends WechatMiniprogram.Component.PropertyOption =
    WechatMiniprogram.Component.PropertyOption,
  TData extends WechatMiniprogram.Component.DataOption =
    WechatMiniprogram.Component.DataOption,
  TMethod extends WechatMiniprogram.Component.MethodOption =
    WechatMiniprogram.Component.MethodOption,
> = WechatMiniprogram.Component.Options<
  TData,
  TProperty,
  TMethod & Record<string, any>,
  ControlledCustomInstanceProperty
> & {
  /** 受控属性配置 */
  controlledProps?: ControlledPropOption[];
};
