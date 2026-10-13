/**
 * 判断值是否为 Function 类型
 * @param val 待判断的值
 */
export function isFunction(val: unknown): val is Function {
  return typeof val === "function";
}

/**
 * 判断值是否为 string 类型
 * @param val 待判断的值
 */
export const isString = (val: unknown): val is string => {
  return typeof val === "string";
};

/**
 * 判断值是否为 null
 * @param value 待判断的值
 */
export const isNull = <T>(value: T | null): value is null => {
  return value === null;
};

/**
 * 判断值是否为 undefined
 * @param value 待判断的值
 */
export const isUndefined = <T>(value: T | undefined): value is undefined =>
  value === undefined;

/**
 * 判断值是否已定义且不为 null
 * @param value 待判断的值
 */
export function isDef(value: unknown): boolean {
  return !isUndefined(value) && !isNull(value);
}

/**
 * 判断值是否为整数
 * @param value 待判断的值
 */
export function isInteger(value: unknown): boolean {
  return Number.isInteger(value);
}

/**
 * 判断值是否为有效的数字（可转为数字且不为 NaN）
 * @param value 待判断的值
 */
export function isNumeric(value: unknown): boolean {
  return !Number.isNaN(Number(value));
}

/**
 * 判断值是否为 number 类型
 * @param value 待判断的值
 */
export function isNumber(value: unknown): boolean {
  return typeof value === "number";
}

/**
 * 判断值是否为 boolean 类型
 * @param value 待判断的值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * 判断值是否为对象或函数
 * @param x 待判断的值
 */
export function isObject(x: unknown): x is Record<string, unknown> {
  const type = typeof x;
  return x !== null && (type === "object" || type === "function");
}

/**
 * 判断值是否为普通对象（POJO）
 * @param val 待判断的值
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
  return (
    val !== null &&
    typeof val === "object" &&
    Object.prototype.toString.call(val) === "[object Object]"
  );
}

/**
 * 判断值是否为空（包括空字符串、空数组、空对象、空 Map 或 Set 等）
 * @param val 待判断的值
 */
export function isEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string" || Array.isArray(val)) return val.length === 0;
  if (val instanceof Map || val instanceof Set) return val.size === 0;
  if (typeof val === "object")
    return Object.keys(val as Record<string, unknown>).length === 0;
  return true;
}
