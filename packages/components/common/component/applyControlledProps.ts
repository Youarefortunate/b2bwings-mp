import type {
  ComponentOptions,
  ControlledCustomInstanceProperty,
} from "./types";

interface ControlledComponentInstance
  extends
    WechatMiniprogram.Component.TrivialInstance,
    ControlledCustomInstanceProperty {}

const getDefaultKey = (key: string) =>
  `default${key.replace(/^(\w)/, (_, first: string) => first.toUpperCase())}`;

/**
 * 应用受控属性机制
 */
export const applyControlledProps = <
  TProperty extends WechatMiniprogram.Component.PropertyOption,
>(
  ops: ComponentOptions<TProperty>,
): ComponentOptions<TProperty> => {
  const controlledProps = ops.controlledProps || [];

  if (!controlledProps.length) {
    return ops;
  }

  const lifetimes = { ...(ops.lifetimes || {}) };
  const methods = {
    ...(ops.methods || {}),
  } as WechatMiniprogram.Component.MethodOption &
    Pick<ControlledCustomInstanceProperty, "_trigger">;
  const oldAttached = lifetimes.attached;

  lifetimes.attached = function (this: ControlledComponentInstance) {
    oldAttached?.call(this);

    controlledProps.forEach(({ key }) => {
      const defaultKey = getDefaultKey(key);
      const props = this.properties;

      /** 属性未传入时进入非受控模式 */
      if (props[key] == null) {
        this._selfControlled = true;
      }

      /** 非受控模式优先使用 defaultXxx 初始化内部属性值 */
      if (props[key] == null && props[defaultKey] != null) {
        this.setData({
          [key]: props[defaultKey],
        });
      }
    });
  };

  /** 统一受控事件触发入口，非受控模式下先同步内部值 */
  methods._trigger = function (
    this: ControlledComponentInstance,
    evtName: string,
    detail: any = {},
    opts?: WechatMiniprogram.Component.TriggerEventOption,
  ) {
    const target = controlledProps.find((item) => item.event === evtName);

    if (target && this._selfControlled) {
      const { key } = target;
      this.setData({
        [key]: detail[key],
      });
    }

    this.triggerEvent(evtName, detail, opts);
  };

  return {
    ...ops,
    lifetimes,
    methods,
  };
};
