import type Request from ".";
import type { RequestInfo, RequestError, RequestPromise } from "./types";

const REQUEST_METHODS = [
  "OPTIONS",
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "DELETE",
  "TRACE",
  "CONNECT",
];

/**
 * 判断 URL 中是否包含请求方法前缀
 * @param url 请求地址
 */
export function hasRequestMethodPrefix(url: RequestInfo["url"]) {
  return url
    .split(/\s+/)
    .some((item) => REQUEST_METHODS.includes(item.toUpperCase()));
}

/**
 * 获取合并的数据
 * @param _this this实例
 * @param options 请求选项
 */
export const mergeConfig = (_this: Request, options: RequestInfo) => {
  const parsed = parseRequestUrl(options);
  const urlType = /^(http|https):\/\//.test(parsed.url);
  const config = Object.assign(
    {
      timeout: _this.timeout,
    },
    _this.config,
    options,
  );

  config.method = (
    options.method ||
    parsed.method ||
    config.method ||
    "POST"
  ).toUpperCase() as NonNullable<RequestInfo["method"]>;
  config.url = urlType ? parsed.url : _this.baseUrl + parsed.url;
  config.header = Object.assign({}, _this.header, options.header || {});
  return config;
};

function parseRequestUrl(options: RequestInfo) {
  const parts = options.url.trim().split(/\s+/).filter(Boolean);
  const methodIndex = parts.findIndex((part) =>
    REQUEST_METHODS.includes(part.toUpperCase()),
  );
  const method =
    methodIndex >= 0
      ? (parts.splice(methodIndex, 1)[0].toUpperCase() as RequestInfo["method"])
      : undefined;

  return {
    method,
    url: parts.join(" "),
  };
}

/**
 * 发起请求
 * @param requestInfo 请求信息
 * @param rawResponse 是否返回微信原始响应
 */
export const dispatchRequest = <T = any>(
  requestInfo: RequestInfo,
  rawResponse = false,
): RequestPromise<T> => {
  let requestTask: WechatMiniprogram.RequestTask | undefined;
  const promise = new Promise<T>((resolve, reject) => {
    let requestAbort = true;

    // 处理成功回调
    const handleSuccess: WechatMiniprogram.RequestSuccessCallback = (res) => {
      requestAbort = false;
      if (rawResponse) {
        resolve(res as T);
        return;
      }

      // 返回响应数据，平铺合并底层 requestTask
      resolve({
        ...(res.data as any),
        requestTask,
      });
    };

    // 处理失败回调
    const handleFail: WechatMiniprogram.RequestFailCallback = (err) => {
      requestAbort = false;
      if (err?.errMsg === "request:fail abort") {
        reject({
          errMsg: "请求超时，请重新尝试",
          statusCode: 0,
        } as RequestError);
      } else {
        reject(err);
      }
    };

    let requestData: WechatMiniprogram.RequestOption = {
      url: requestInfo.url,
      header: requestInfo.header,
      success: handleSuccess,
      fail: handleFail,
    };

    const appendData = appendDataToRequest(requestInfo);
    requestData = Object.assign(requestData, appendData);

    requestTask = wx.request(requestData);
    if (requestInfo?.onRequestTask) {
      requestInfo.onRequestTask(requestTask);
    }
    // 是否超时自动取消
    if (requestInfo?.timeoutAbort) {
      // 超时请求中断
      setTimeout(() => {
        if (requestAbort) {
          requestTask?.abort();
        }
      }, requestInfo.timeout);
    }
  }) as RequestPromise<T>;

  promise.requestTask = requestTask;
  return promise;
};

/**
 * 追加请求数据
 * @param requestInfo 请求信息
 */
function appendDataToRequest(requestInfo: RequestInfo) {
  const requestData: Partial<RequestInfo> = {};
  if (requestInfo.method) {
    requestData.method = requestInfo.method;
  }
  if (requestInfo.data) {
    requestData.data = requestInfo.data;
  }
  if (requestInfo.timeout) {
    requestData.timeout = requestInfo.timeout;
  }
  if (requestInfo.dataType) {
    requestData.dataType = requestInfo.dataType;
  }

  return requestData;
}
