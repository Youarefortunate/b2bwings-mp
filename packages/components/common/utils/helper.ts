import config from "../config/index";
import { isDef, isNumeric, isObject, isString, isBoolean } from "./validator";
import { getDeviceInfo, getWindowInfo } from "./wechat";

interface WxWorkSystemInfo extends WechatMiniprogram.SystemInfo {
  environment?: "wxwork";
}
interface SystemInfo extends WxWorkSystemInfo {}

/** 设备系统信息 */
const deviceInfo = getDeviceInfo();

/** 当前窗口系统信息 */
export const systemInfo: WechatMiniprogram.WindowInfo | SystemInfo =
  getWindowInfo();

/**
 * 是否是 iOS 设备
 * @returns 是否为 iOS
 */
export const isIOS = function (): boolean {
  return !!(deviceInfo?.system?.toLowerCase().search("ios") + 1);
};

/**
 * 是否在企业微信环境
 * @returns 是否为企微环境
 */
export const isWxWork = (deviceInfo as any)?.environment === "wxwork";

/**
 * 是否在 PC 端（mac / windows）
 * @returns 是否为 PC
 */
export const isPC = ["mac", "windows"].includes(deviceInfo?.platform || "");

/**
 * 为数值或字符串大小添加单位，默认为 px
 * @param value 尺寸值
 * @returns 带单位的尺寸字符串
 */
export const addUnit = function (value?: string | number): string | undefined {
  if (!isDef(value)) {
    return undefined;
  }
  const strVal = String(value);
  return isNumeric(strVal) ? `${strVal}px` : strVal;
};

/**
 * 数组切片分块
 * @param arr 输入数组
 * @param size 分块大小
 * @returns 分块后的二维数组
 */
export const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

/**
 * 获取组件实例
 * @param context 上下文对象
 * @param selector 选择器
 * @returns 组件实例或 null
 */
export const getInstance = function (
  context?:
    | WechatMiniprogram.Component.TrivialInstance
    | WechatMiniprogram.Page.TrivialInstance,
  selector?: string,
): WechatMiniprogram.Component.TrivialInstance | null {
  let ctx = context;
  if (!ctx) {
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    ctx = (page as any).$$basePage || page;
  }
  const instance = ctx && selector ? ctx.selectComponent(selector) : null;
  if (!instance) {
    console.warn("未找到组件,请检查selector是否正确");
    return null;
  }
  return instance;
};

/**
 * 尺寸单位转化（rpx 转 px，基于系统屏幕宽度）
 * @param value 尺寸输入
 * @returns 转化后的 px 像素值
 */
export const unitConvert = (
  value: number | string | null | undefined,
): number => {
  if (typeof value === "string") {
    if (value.includes("rpx")) {
      const systemWidth = wx.getWindowInfo
        ? wx.getWindowInfo().screenWidth
        : 375;
      return (parseInt(value, 10) * (systemWidth || 750)) / 750;
    }
    return parseInt(value, 10);
  }
  return value ?? 0;
};

/**
 * 设置组件内部 icon 数据
 * @param iconName 内部绑定的 icon 属性名称
 * @param icon 外部传入的 icon 配置
 * @param defaultIcon 默认 icon 名称
 * @returns icon 渲染数据键值对
 */
export const setIcon = (
  iconName: string,
  icon: unknown,
  defaultIcon: string,
): Record<string, unknown> => {
  if (icon) {
    if (typeof icon === "string") {
      return {
        [`${iconName}Name`]: icon,
        [`${iconName}Data`]: {},
      };
    }
    if (typeof icon === "object") {
      return {
        [`${iconName}Name`]: "",
        [`${iconName}Data`]: icon,
      };
    }
    return {
      [`${iconName}Name`]: defaultIcon,
      [`${iconName}Data`]: {},
    };
  }
  return {
    [`${iconName}Name`]: "",
    [`${iconName}Data`]: {},
  };
};

/**
 * 短横线转小驼峰 (kebab-case -> camelCase)
 * @param str 短横线字符串
 * @returns 驼峰字符串
 */
export const toCamel = (str: string): string =>
  str.replace(/-(\w)/g, (_, m1) => m1.toUpperCase());

/**
 * 小驼峰转短横线 (camelCase -> kebab-case)
 * @param str 小驼峰字符串
 * @returns 短横线字符串
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([0-9])([a-zA-Z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * 获取当前最顶层页面实例
 * @returns 页面实例
 */
export const getCurrentPage = function <T>(): T &
  WechatMiniprogram.Page.TrivialInstance {
  const pages = getCurrentPages();
  return pages[pages.length - 1] as T & WechatMiniprogram.Page.TrivialInstance;
};

/**
 * 自动生成全局唯一 ID 工厂函数
 * @param compName 组件名称
 * @returns 唯一 ID 生成器函数
 */
export const uniqueFactory = (compName: string): (() => string) => {
  let number = 0;
  return () => {
    const uniqueId = `${config.prefix}_${compName}_${number}`;
    number += 1;
    return uniqueId;
  };
};

/**
 * 校验并转化组件传入的 icon 属性值
 * @param icon 传入的 icon 配置
 * @param defaultIcon 默认 icon 名称
 * @returns 格式化后的 icon 对象
 */
export const calcIcon = (
  icon: unknown,
  defaultIcon?: string,
): Record<string, unknown> | null => {
  if (icon && ((isBoolean(icon) && defaultIcon) || isString(icon))) {
    return { name: isBoolean(icon) ? defaultIcon : icon };
  }
  if (isObject(icon)) {
    return icon;
  }
  return null;
};

/**
 * 是否超出文件大小限制
 * @param size 文件大小
 * @param sizeLimit 大小限制配置（字节数或限制对象）
 * @returns 是否超限
 */
export const isOverSize = (
  size: number,
  sizeLimit:
    | number
    | { size: number; unit?: "B" | "KB" | "MB" | "GB" }
    | null
    | undefined,
): boolean => {
  if (!sizeLimit) return false;

  const base = 1000;
  const unitMap = {
    B: 1,
    KB: base,
    MB: base * base,
    GB: base * base * base,
  };

  if (typeof sizeLimit === "number") {
    return size > sizeLimit * base;
  }

  const limitSize = sizeLimit.size;
  const unit = sizeLimit.unit ?? "KB";
  const computedSize = limitSize * unitMap[unit];

  return size > computedSize;
};

/**
 * rpx 转 px 尺寸
 * @param rpx 尺寸值（rpx）
 * @returns px 尺寸像素值
 */
export const rpx2px = (rpx: number): number => {
  const systemWidth = wx.getWindowInfo ? wx.getWindowInfo().windowWidth : 375;
  return Math.floor((systemWidth * rpx) / 750);
};

/**
 * 获取小程序的下一个渲染帧 Promise
 * @returns 延迟 Promise
 */
export const nextTick = (): Promise<void> => {
  return new Promise((resolve) => {
    wx.nextTick(() => {
      resolve();
    });
  });
};

/**
 * 计算字符串字符的长度并可以截取字符串
 * @param type 限制类型：maxcharacter (1个汉字=2个字符) 或 maxlength (字符个数)
 * @param char 传入的字符串或数值
 * @param max 最大字符串长度限制数
 * @returns 截取后的字符串及其长度
 */
export const getCharacterLength = (
  type: string,
  char: string | number,
  max?: number,
): { length: number; characters: string } => {
  const str = String(char ?? "");

  if (str.length === 0) {
    return {
      length: 0,
      characters: "",
    };
  }

  if (type === "maxcharacter" && max !== undefined) {
    let len = 0;
    for (let i = 0; i < str.length; i += 1) {
      let currentStringLength = 0;
      if (str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94) {
        currentStringLength = 2;
      } else {
        currentStringLength = 1;
      }
      if (len + currentStringLength > max) {
        return {
          length: len,
          characters: str.slice(0, i),
        };
      }
      len += currentStringLength;
    }
    return {
      length: len,
      characters: str,
    };
  }

  if (type === "maxlength" && max !== undefined) {
    const length = str.length > max ? max : str.length;
    return {
      length,
      characters: str.slice(0, length),
    };
  }

  return {
    length: str.length,
    characters: str,
  };
};
