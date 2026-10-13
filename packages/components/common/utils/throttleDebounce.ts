/**
 * 防抖函数
 * @param func 回调函数
 * @param wait 延迟时间（毫秒）
 * @returns 包装后的防抖函数
 */
export const debounce = function (
  func: Function,
  wait: number = 500,
): Function {
  let timerId: number | null = null;
  return function (this: unknown, ...rest: unknown[]) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      func.apply(this, rest);
    }, wait) as unknown as number;
  };
};

/**
 * 节流函数
 * @param func 回调函数
 * @param wait 间隔时间（毫秒）
 * @param options 配置参数，是否首次立即执行
 * @returns 包装后的节流函数
 */
export const throttle = (
  func: Function,
  wait: number = 100,
  options: { leading?: boolean } | null = null,
): Function => {
  let previous = 0;
  let timerid: number | null = null;
  const opts = options || { leading: true };

  return function (this: unknown, ...args: unknown[]) {
    const now = Date.now();

    if (!previous && !opts.leading) previous = now;

    const remaining = wait - (now - previous);

    if (remaining <= 0) {
      if (timerid) {
        clearTimeout(timerid);
        timerid = null;
      }
      previous = now;
      func.apply(this, args);
    }
  };
};
