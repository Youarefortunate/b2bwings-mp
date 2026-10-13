/**
 * 微信小程序组件属性类型与普通 TypeScript 类型双向转换工具
 */

export {};

declare global {
  type ResolveConstructor<T> = T extends StringConstructor
    ? string
    : T extends NumberConstructor
      ? number
      : T extends BooleanConstructor
        ? boolean
        : T extends ArrayConstructor
          ? any[]
          : T extends FunctionConstructor
            ? (...args: any[]) => any
            : T extends ObjectConstructor
              ? Record<string, any>
              : T extends null
                ? any
                : T;

  type WxPropertyToPlain<P> = "value" extends keyof P
    ? P extends { value: infer V }
      ? V
      : P extends { value?: infer V }
        ? V
        : never
    : P extends { type: infer T }
      ? ResolveConstructor<T>
      : ResolveConstructor<P>;

  /**
   * 将微信小程序组件属性类型（包含 type 和 value 的对象结构）转换为普通的 TypeScript 类型
   *
   * @example
   * interface WxProps {
   *   closeBtn?: { type: BooleanConstructor; value?: boolean };
   * }
   * type PlainProps = ToPlain<WxProps>; // { closeBtn?: boolean }
   */
  type ToPlain<T> = {
    [K in keyof T]: WxPropertyToPlain<Exclude<T[K], undefined>>;
  };

  type IsUnion<T, U = T> = T extends any
    ? [U] extends [T]
      ? false
      : true
    : never;

  type PlainToWxProperty<V> = {
    type: any extends V
      ? null
      : true extends IsUnion<V>
        ? null
        : [null] extends [V]
          ? null
          : [V] extends [boolean]
            ? BooleanConstructor
            : [V] extends [string]
              ? StringConstructor
              : [V] extends [number]
                ? NumberConstructor
                : [V] extends [any[]]
                  ? ArrayConstructor
                  : [V] extends [(...args: any[]) => any]
                    ? FunctionConstructor
                    : ObjectConstructor;
    value?: V;
    observer?:
      | string
      | ((newVal: V, oldVal: V, changedPath: Array<string | number>) => void);
    optionalTypes?: WechatMiniprogram.Component.ShortProperty[];
  };

  /**
   * 将普通的 TypeScript 类型转换为微信小程序组件属性类型（包含 type 和 value 的对象结构）
   *
   * @example
   * interface PlainProps {
   *   closeBtn?: boolean;
   * }
   * type WxProps = ToWx<PlainProps>; // { closeBtn?: { type: BooleanConstructor; value?: boolean } }
   */
  type ToWx<T> = {
    [K in keyof T]: PlainToWxProperty<Exclude<T[K], undefined>>;
  };
}
