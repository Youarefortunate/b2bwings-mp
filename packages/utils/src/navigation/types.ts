/** 微信官方跳转参数映射表 */
export interface NavModeMap {
  navigateTo: WechatMiniprogram.NavigateToOption;
  redirectTo: WechatMiniprogram.RedirectToOption;
  reLaunch: WechatMiniprogram.ReLaunchOption;
  switchTab: WechatMiniprogram.SwitchTabOption;
  navigateBack: WechatMiniprogram.NavigateBackOption;
}

/** 支持的跳转方式 */
export type NavModo = keyof NavModeMap;

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

/** 基础自定义配置 */
export interface NavBaseOptions<M extends NavModo = NavModo> {
  /** 跳转模式：navigateTo、redirectTo、reLaunch、switchTab、navigateBack */
  modo?: M;
  /** 延迟跳转时间（毫秒） */
  delay?: number;
  /** web-view 基础 URL，用于拼接非完整链接 */
  webViewBaseUrl?: string;
  /** 跳转路径，可以带 / 也可以不带 */
  url?: string;
  /** query 参数对象 */
  query?: Record<string, any>;
}

/** 根据模式名动态构建对应的配置分支 */
export type NavParams<M extends NavModo> = M extends "navigateBack"
  ? Omit<NavBaseOptions<M>, "url" | "query"> &
      Partial<NavModeMap[M]> & { modo: M }
  : NavBaseOptions<M> &
      Partial<NavModeMap[M]> &
      (M extends "navigateTo" ? { modo?: M } : { modo: M });

/** 联合类型：（保留用于向下兼容或三参数调用）跳转配置项 */
export type NavOptions = {
  [K in NavModo]: NavParams<K>;
}[NavModo];

/** 对象式调用参数 */
export type NavToParamsObject<M extends NavModo = NavModo> = NavParams<M>;

/** 归一化后的内部透传参数 */
export interface NavToParamsInner<M extends NavModo = NavModo> {
  url: string;
  query: Record<string, any>;
  options: NavParams<M>;
}

/** 跳转函数接口定义 */
export interface NavToInterface {
  /**
   * 跳转函数（单参数对象形式）
   * @example
   * wx.navTo({ url: "pages/index/index", modo: "navigateTo", events: {} })
   * wx.navTo({ modo: "navigateBack", delta: 2 })
   */
  <M extends NavModo>(params: NavToParamsObject<M>): Promise<boolean>;
  /**
   * 跳转函数（三参数位置形式：url、query、options）
   * @example
   * wx.navTo("pages/index/index", {}, { modo: "redirectTo" })
   * wx.navTo("", {}, { modo: "navigateBack", delta: 1 })
   */
  <M extends NavModo>(
    url: string,
    query?: Record<string, any>,
    options?: DistributiveOmit<NavParams<M>, "url" | "query">,
  ): Promise<boolean>;
}
