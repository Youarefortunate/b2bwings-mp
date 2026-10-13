/**
 * 获取 IntersectionObserver 对象
 * @param context 当前组件或页面上下文
 * @param selector 目标元素选择器
 */
export const getObserver = (
  context:
    | WechatMiniprogram.Component.TrivialInstance
    | WechatMiniprogram.Page.TrivialInstance,
  selector: string,
): Promise<WechatMiniprogram.IntersectionObserverObserveCallbackResult> => {
  return new Promise((resolve) => {
    context
      .createIntersectionObserver({
        nativeMode: true,
      } as WechatMiniprogram.CreateIntersectionObserverOption)
      .relativeToViewport()
      .observe(selector, (res) => {
        resolve(res);
      });
  });
};

/**
 * 获取窗口系统信息，解决单页分享模式下的兼容问题
 * @returns 窗口系统信息
 */
export const getWindowInfo = ():
  | WechatMiniprogram.WindowInfo
  | WechatMiniprogram.SystemInfo => {
  return wx.getWindowInfo
    ? wx.getWindowInfo() || wx.getSystemInfoSync()
    : wx.getSystemInfoSync();
};

/**
 * 获取应用基础信息，解决单页分享模式下的兼容问题
 * @returns 应用基础信息
 */
export const getAppBaseInfo = ():
  | WechatMiniprogram.AppBaseInfo
  | WechatMiniprogram.SystemInfo => {
  return wx.getAppBaseInfo
    ? wx.getAppBaseInfo() || wx.getSystemInfoSync()
    : wx.getSystemInfoSync();
};

/**
 * 获取设备系统信息，解决单页分享模式下的兼容问题
 * @returns 设备系统信息
 */
export const getDeviceInfo = ():
  | WechatMiniprogram.DeviceInfo
  | WechatMiniprogram.SystemInfo => {
  return wx.getDeviceInfo
    ? wx.getDeviceInfo() || wx.getSystemInfoSync()
    : wx.getSystemInfoSync();
};
