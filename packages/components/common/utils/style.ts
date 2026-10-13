/**
 * 动态拼接 CSS Class 类名
 * @param args 可变类名参数，可以是字符串、数字、数组或对象
 * @returns 拼接后的 Class 字符串
 */
export const classNames = function (...args: unknown[]): string {
  const hasOwn = {}.hasOwnProperty;
  const classes: (string | number)[] = [];

  args.forEach((arg) => {
    if (!arg) return;

    const argType = typeof arg;

    if (argType === "string" || argType === "number") {
      classes.push(arg as string | number);
    } else if (Array.isArray(arg) && arg.length) {
      const inner = classNames(...arg);
      if (inner) {
        classes.push(inner);
      }
    } else if (argType === "object") {
      const obj = arg as Record<string, unknown>;
      for (const key in obj) {
        if (hasOwn.call(obj, key) && obj[key]) {
          classes.push(key);
        }
      }
    }
  });

  return classes.join(" ");
};

/**
 * 将样式对象转换为内联 style 字符串
 * @param styleObj 样式对象键值对
 * @returns CSS 样式内联字符串
 */
export const styles = function (
  styleObj: Record<string, string | number | undefined>,
): string {
  return Object.keys(styleObj)
    .filter((styleKey) => styleObj[styleKey] !== undefined)
    .map((styleKey) => `${styleKey}: ${styleObj[styleKey]}`)
    .join("; ");
};
