/**
 * 获取视口动画帧
 * @param context 当前上下文实例
 * @param cb 回调函数
 * @returns 选择器查询对象
 */
export const getAnimationFrame = (
  context:
    | WechatMiniprogram.Component.TrivialInstance
    | WechatMiniprogram.Page.TrivialInstance,
  cb: () => void,
): WechatMiniprogram.SelectorQuery => {
  const query = context.createSelectorQuery();
  query.selectViewport().boundingClientRect();
  query.exec(() => {
    cb();
  });
  return query;
};

/**
 * 获取指定选择器对应的节点信息
 * @param context 当前上下文实例
 * @param selector 选择器字符串
 * @param needAll 是否获取所有节点，默认 false 仅获取单个
 * @returns 节点位置信息 Promise
 */
export const getRect = (
  context:
    | WechatMiniprogram.Component.TrivialInstance
    | WechatMiniprogram.Page.TrivialInstance,
  selector: string,
  needAll: boolean = false,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    context
      .createSelectorQuery()
      [needAll ? "selectAll" : "select"](selector)
      .boundingClientRect((rect) => {
        if (rect) {
          resolve(rect);
        } else {
          reject(new Error(`Node not found for selector: ${selector}`));
        }
      })
      .exec();
  });
};
