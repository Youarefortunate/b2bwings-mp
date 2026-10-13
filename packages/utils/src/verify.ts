/**
 * 校验是否为超链接
 * @param value 待校验的字符串
 * @returns 是否为超链接
 */
export function isHyperLink(value: string): boolean {
  const HYPERLINK = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
  return HYPERLINK.test(value);
}
