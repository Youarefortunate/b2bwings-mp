import type { NavModo, NavToInterface, NavOptions } from "./types";
import { isHyperLink } from "../verify";
import { isPlainObject, isEmpty, includes } from "../utils";

const DEEP_PARAM_FLAG = "__deep_params_key__";
const DEEP_PARAM_STORAGE_PREFIX = "deep_params_";
// web-view页面白名单
const WEB_VIEW_WHITELIST = ["pages/web-view/web-view"];

class Navigator {
  private __deepParamsStore = new Map();
  private __tabBarLinks: string[] = [];

  /**
   * 设置 TabBar 路由链接列表，解耦应用层与工具包
   * @param links TabBar 路由路径列表
   */
  setTabBarLinks(links: readonly string[]): void {
    this.__tabBarLinks = links as string[];
  }

  /**
   * 获取当前设置的 TabBar 路由链接列表
   * @returns TabBar 路由路径列表
   */
  getTabBarLinks(): string[] {
    return this.__tabBarLinks;
  }

  /**
   * 归一化 navTo 参数
   * @param args 参数列表
   * @returns 归一化后的路由参数
   */
  parseNavParams(...args: any[]) {
    const [args1, args2, args3] = args;

    // 情况 1：对象调用方式 navTo({ url, query, ...options }) 或 navTo({ url, query, options })
    if (isPlainObject(args1)) {
      const {
        url = "",
        query = {},
        options = {},
        ...rest
      } = args1 as Record<string, any>;
      // 优先级：显式的 options 字段 > 平铺在顶层的 rest 字段
      const mergedOptions = { ...rest, ...options };

      return {
        url,
        query: query || {},
        options: mergedOptions as NavOptions,
      };
    }

    // 情况 2：三参数调用方式 navTo(url, query, options)
    return {
      url: args1 || "",
      query: args2 || {},
      options: (args3 || {}) as NavOptions,
    };
  }

  /**
   * 跳转到指定页面（支持深层对象参数）
   */
  navTo: NavToInterface = (...args: any[]) => {
    const { url, query, options } = this.parseNavParams(...args);

    return new Promise<boolean>((resolve, reject) => {
      const {
        modo = "navigateTo",
        delay = 0,
        webViewBaseUrl = "",
      } = options || {};

      if (!url && modo !== "navigateBack") {
        return resolve(false);
      }

      let queryStr = "";
      let hasDeep = false;
      const deepParams: Record<string, any> = {};

      const actions: Record<NavModo, (...args: any[]) => any> = {
        redirectTo: wx.redirectTo,
        reLaunch: wx.reLaunch, // 重启小程序
        navigateBack: wx.navigateBack,
        navigateTo: wx.navigateTo,
        switchTab: wx.switchTab,
      };

      // web-view页面自动 encode URL 参数
      if (WEB_VIEW_WHITELIST.includes(url) && query?.url) {
        // 如果不是以 http/https 开头，则拼接基础路径
        if (!isHyperLink(query.url)) {
          query.url = `${webViewBaseUrl}${query.url}`;
        }
        query.url = encodeURIComponent(query.url);
      }

      for (const key in query) {
        const val = query[key];
        if (val === undefined || val === null) continue;

        if (this.isDeep(val)) {
          deepParams[key] = val;
          delete query[key]; // 从 query 移除
          hasDeep = true;
        }
      }

      if (hasDeep) {
        const deepKey = `${DEEP_PARAM_STORAGE_PREFIX}${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}`;
        const store = this.getDeepParamStore();
        store.set(deepKey, deepParams);
        query[DEEP_PARAM_FLAG] = deepKey;
      }

      if (!isEmpty(query)) {
        queryStr = "?" + this.urlEncode(query);
      }

      // 使用normalizeUrl确保URL有正确的"/"前缀
      const fullUrl = url ? `${this.normalizeUrl(url)}${queryStr}` : "";
      const action = actions[modo as NavModo] || actions.navigateTo;

      const performNav = () => {
        const navParams = {
          ...options,
          success: () => resolve(true),
          fail: (err: { errMsg: string }) => reject(err),
        } as any;

        if (modo === "navigateBack") {
          action(navParams as WechatMiniprogram.NavigateBackOption);
        } else {
          navParams.url = fullUrl;
          // 规范化路径用于 TabBar 匹配（移除前导斜杠）
          const normalizedPath = url.replace(/^\//, "");
          if (
            includes(
              this.getTabBarLinks().map((link: string) =>
                link.replace(/^\//, ""),
              ),
              normalizedPath,
            )
          ) {
            // tabBar页面使用switchTab
            actions.switchTab(navParams as WechatMiniprogram.SwitchTabOption);
          } else {
            action(navParams);
          }
        }
      };

      if (delay > 0) {
        setTimeout(performNav, delay);
      } else {
        performNav();
      }
    });
  };

  /**
   * 标准化URL路径，确保有"/"前缀
   * @param path URL路径
   * @returns 标准化后的URL路径
   */
  normalizeUrl(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
  }

  /**
   * 页面 onLoad 时，自动恢复深层参数
   * @param ctx 页面实例
   * @param args onLoad 参数
   */
  restoreDeepParams(
    ctx: WechatMiniprogram.Page.TrivialInstance & {
      __deepParamKey__?: string | null;
    },
    args: any,
  ): void {
    const key = args[DEEP_PARAM_FLAG];
    if (!key) return;

    const store = this.getDeepParamStore();
    const data = store.get(key);
    if (data) {
      Object.assign(args, data);
      ctx.__deepParamKey__ = key;
    }
  }

  /**
   * 页面 onUnload 时，自动清除深层参数
   * @param ctx 页面实例
   */
  clearDeepParams(
    ctx: WechatMiniprogram.Page.TrivialInstance & {
      __deepParamKey__?: string | null;
    },
  ): void {
    if (ctx.__deepParamKey__) {
      const store = this.getDeepParamStore();
      store.delete(ctx.__deepParamKey__);
      ctx.__deepParamKey__ = null;
    }
  }

  /**
   * 判断是否为深层对象（对象或数组）
   * @param val 待检测的值
   * @returns 是否为深层对象
   */
  isDeep(val: any): boolean {
    if (val === null) return false;
    const type = typeof val;
    if (type === "object") {
      if (Array.isArray(val)) return val.length > 0;
      return Object.keys(val).length > 0;
    }
    return false;
  }

  /**
   * 对象转URL参数
   * @param obj 待转换的对象
   * @returns 转换后的query字符串
   */
  urlEncode(obj: Record<string, any> = {}): string {
    const result: string[] = [];
    for (const key in obj) {
      const item = obj[key];
      if (item === undefined || item === null || item === "") {
        continue;
      }
      if (Array.isArray(item)) {
        item.forEach((val) => {
          result.push(key + "=" + val);
        });
      } else {
        result.push(key + "=" + item);
      }
    }
    return result.join("&");
  }

  /**
   * 统一获取深层参数存储（优先挂到全局 app，回退本实例）
   * @returns 参数存储 Map
   */
  getDeepParamStore(): Map<any, any> {
    try {
      const app = getApp?.();
      if (app) {
        if (!app.__deepParamsStore) {
          app.__deepParamsStore = new Map();
        }
        return app.__deepParamsStore as Map<any, any>;
      }
    } catch {
      // 忽略 getApp 异常，回退到实例级别
    }

    if (!this.__deepParamsStore) {
      this.__deepParamsStore = new Map();
    }
    return this.__deepParamsStore;
  }
}

const navigator = new Navigator();

export default navigator;
export { Navigator, navigator };
export type * from "./types";
