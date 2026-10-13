/** 判断数组或字符串是否包含指定值 */
export function includes(
  collection: readonly unknown[] | string,
  value: unknown,
): boolean {
  return typeof collection === "string"
    ? typeof value === "string" && collection.includes(value)
    : collection.includes(value);
}

/** 判断空值、字符串、数组或普通对象是否为空 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }
  return isPlainObject(value) && Object.keys(value).length === 0;
}

/** 判断值是否为 Object 原型或 null 原型的普通对象 */
export function isPlainObject(
  value: unknown,
): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** 递归比较基础值、数组和普通对象是否相等 */
export function isEqual(value: unknown, other: unknown): boolean {
  if (value === other) return true;
  if (Number.isNaN(value) && Number.isNaN(other)) return true;

  if (Array.isArray(value) || Array.isArray(other)) {
    return (
      Array.isArray(value) &&
      Array.isArray(other) &&
      value.length === other.length &&
      value.every((item, index) => isEqual(item, other[index]))
    );
  }

  if (!isPlainObject(value) || !isPlainObject(other)) return false;

  const keys = Object.keys(value);
  return (
    keys.length === Object.keys(other).length &&
    keys.every(
      (key) => Object.hasOwn(other, key) && isEqual(value[key], other[key]),
    )
  );
}

/**
 * 获取当前页面栈顶部页面实例
 * @returns 顶部页面实例或 undefined
 */
export function getCurrentPage():
  | WechatMiniprogram.Page.Instance<
      WechatMiniprogram.IAnyObject,
      WechatMiniprogram.IAnyObject
    >
  | undefined {
  const pages = getCurrentPages();
  return pages && pages.length > 0 ? pages[pages.length - 1] : undefined;
}

/**
 * 为对象的所有一级属性名统一添加指定前缀
 * @param props 原始属性对象
 * @param prefix 前缀字符串
 * @returns 添加前缀后的新对象
 */
export const addPropsPrefix = <T extends Record<string, any>>(
  props: T,
  prefix: string,
) => {
  const upperFirst = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  return Object.keys(props).reduce(
    (target, key) => {
      target[`${prefix}${upperFirst(key)}`] = props[key];
      return target;
    },
    {} as Record<string, T[keyof T]>,
  );
};

const validUnits = [
  "px",
  "cm",
  "mm",
  "in",
  "pt",
  "pc",
  "em",
  "ex",
  "ch",
  "rem",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "%",
  "rpx",
];

/**
 * 为数值补齐样式单位。
 * 已带单位或 `auto` 的字符串会原样返回，非法 unit 默认回退到 `rpx`。
 * @param val 待处理的数值或字符串
 * @param unit 样式单位，默认 `rpx`
 * @returns 处理后的带单位字符串
 */
export function getUnit(val: string | number | null | undefined, unit = "rpx") {
  if (val == null || val === "") return "";

  if (typeof val === "string" && /%|px|rpx|auto$/.test(val)) return val;

  const num = Number(val);
  if (Number.isNaN(num) || !Number.isFinite(num)) return val;

  const unitStr = unit && typeof unit === "string" ? unit.toLowerCase() : "";
  const finalUnit = validUnits.includes(unitStr) ? unitStr : "rpx";

  return `${num}${finalUnit}`;
}

/**
 * 在内联样式字符串与样式对象之间转换。
 * 默认返回 WXML 可直接绑定的样式字符串，传入 `object` 时返回对象格式。
 * @param customStyle 待转换的样式字符串或对象
 * @param target 目标转换格式（"string" | "object"），默认 "string"
 * @returns 转换后的样式字符串或对象
 */
export function formatStyle(
  customStyle:
    | Record<string, string | number | undefined>
    | string
    | null
    | undefined,
  target: "string" | "object" = "string",
): string | Record<string, string | number | undefined> {
  if (isEmpty(customStyle)) {
    return target === "string" ? "" : {};
  }

  if (
    (typeof customStyle === "object" && target === "object") ||
    (target === "string" && typeof customStyle === "string")
  ) {
    return customStyle!;
  }

  if (target === "object") {
    const styleArray = String(customStyle).trim().split(";");
    const style: Record<string, string | number | undefined> = {};

    for (let i = 0; i < styleArray.length; i++) {
      if (styleArray[i]) {
        const item = styleArray[i].split(":");
        style[item[0].trim()] = item[1]?.trim();
      }
    }

    return style;
  }

  let string = "";

  for (const i in customStyle as Record<string, string | number | undefined>) {
    const key = i.replace(/([A-Z])/g, "-$1").toLowerCase();
    string += `${key}:${(customStyle as Record<string, string | number | undefined>)[i]};`;
  }

  return string.trim();
}
