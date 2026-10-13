import { getAppBaseInfo } from "./utils/wechat";

let systemInfo: WechatMiniprogram.AppBaseInfo | WechatMiniprogram.SystemInfo;

/**
 * 获取基础库版本判断所需的系统信息
 */
const getSystemInfo = () => {
  if (!systemInfo) {
    systemInfo = getAppBaseInfo();
  }
  return systemInfo;
};

/**
 * 比较两个版本号大小，返回 1 表示 versionA 更高，-1 表示 versionB 更高，0 表示相等
 */
export const compareVersion = (versionA: string, versionB: string) => {
  if (!versionA || !versionB) return -1;
  const first = versionA.split(".");
  const second = versionB.split(".");
  const length = Math.max(first.length, second.length);

  while (first.length < length) first.push("0");
  while (second.length < length) second.push("0");

  for (let index = 0; index < length; index += 1) {
    const firstValue = Number(first[index]);
    const secondValue = Number(second[index]);

    if (firstValue > secondValue) return 1;
    if (firstValue < secondValue) return -1;
  }

  return 0;
};

/** 判断当前基础库版本是否满足指定最低版本 */
export const judgeByVersion = (version: string) =>
  compareVersion(getSystemInfo().SDKVersion, version) >= 0;

/**
 * 判断是否可使用 wx://form-field-button 内置表单按钮行为
 * @description 详情：https://developers.weixin.qq.com/miniprogram/dev/component/form.html#wx-form-field
 */
export const canIUseFormFieldButton = () => judgeByVersion("2.10.3");

/**
 * 判断是否可使用 virtualHost 选项
 * @description 详情：https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E8%99%9A%E6%8B%9F%E5%8C%96%E7%BB%84%E4%BB%B6%E8%8A%82%E7%82%B9
 */
export const canUseVirtualHost = () => judgeByVersion("2.19.2");
