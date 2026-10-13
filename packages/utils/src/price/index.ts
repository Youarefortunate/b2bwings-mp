import { isEmpty } from "../utils";

const formatThousands = (input: string): string =>
  input.replace(/^-?\d+/g, (match) =>
    match.replace(/(?=(?!\b)(\d{3})+$)/g, ","),
  );

const ensureNumeric = (value: number | string): boolean =>
  !Number.isNaN(Number(value));

const isEmptyPrice = (value: number | string): boolean =>
  value == null || (typeof value === "string" && isEmpty(value));

/**
 * 金额转换千分位，并自定义保留小数位。
 * 10000 => "10,000.00"
 * @param num 原始数值
 * @param fixed 小数位
 * @returns 格式化后的金额字符串，空值或非数字原样返回
 */
export function formatPriceToFixed(num: number | string, fixed = 2) {
  if (isEmptyPrice(num) || !ensureNumeric(num)) {
    return num;
  }
  if (Number(num) > Number.MAX_SAFE_INTEGER) {
    return formatThousands(String(num));
  }
  return formatThousands(Number(num).toFixed(fixed));
}
