# 小程序接入与使用

在小程序中配置 `xbd-utils` 的请求与上传，并通过 Hook 在页面里使用。各模块完整 API 见 
- [request 请求工具](./src/request/README.md)。
- [upload 上传工具](./src/upload/README.md)。
- [hooks](./src/hooks/README.md)。

## 目录结构

`Request` 与 `Upload` 都继承 `BaseTransport`，共享同一套拦截器生命周期，因此放进同一个目录，共用一份基础配置与一组拦截器，鉴权、Loading、错误提示行为保持一致。

```text
lib/request/
├── index.ts     # 统一出口：请求/上传实例 + 业务侧 hooks
├── shared.ts    # 共享基础配置与拦截器
├── request.ts   # 请求实例
└── upload.ts    # 上传实例
```

`baseUrl` 等环境相关的值来自 `@/config`，该文件由 `xbd-mp-env` 按当前环境生成，见 [mp-env 环境切换](../mp-env/README.md)。

## shared.ts：共享基础配置与拦截器

```ts
// lib/request/shared.ts
import { TOKEN } from "@/constant/auth";
import config from "@/config";
import type {
  TransportConfig,
  TransportDispatchResult,
  TransportError,
  TransportInfo,
} from "xbd-utils/transport";
import type { RequestError, RequestInfo } from "xbd-utils/request";

/** 后端统一响应结构 */
export interface AppResponseData {
  code: number;
  message: string;
  data?: any;
}

type SharedTransportInfo = TransportInfo & RequestInfo;
type SharedDispatchResult = TransportDispatchResult<
  SharedTransportInfo,
  AppResponseData
> &
  SharedTransportInfo;

/** Request 与 Upload 共用的基础配置 */
export const baseTransportOptions = {
  baseUrl: config.baseUrl,
  timeout: 15000,
  config: {
    isPrompt: false, // 默认不自动弹 toast，由拦截器按业务码决定
    load: true,
    loadText: "加载中",
  } as TransportConfig,
};

// 并发计数：多个请求同时进行时只显示一次 Loading
let requestNum = 0;
// 未登录弹窗防抖：避免并发请求同时弹出多个登录提示
let loginModal = false;

export const requestInterceptor = <T extends SharedTransportInfo>(
  options: T,
): T => {
  if (options.load) {
    if (requestNum <= 0) {
      wx.showLoading({ title: options.loadText || "加载中", mask: true });
    }
    requestNum += 1;
  }

  // 每次请求前读取最新登录态，避免把易变 Token 固定在实例配置里
  const token = wx.getStorageSync<string>(TOKEN);
  if (token) options.header = { ...options.header, [TOKEN]: token };
  return options;
};

export const responseInterceptor = async ({
  response,
  isPrompt,
}: SharedDispatchResult): Promise<AppResponseData> => {
  if (response.code === 200) {
    if (isPrompt && response.message) {
      wx.showToast({ title: response.message, icon: "none" });
    }
    return response;
  }

  // 未登录：清空本地存储并引导登录
  if (response.code === 40000) {
    wx.clearStorageSync();
    if (!loginModal) {
      loginModal = true;
      wx.showModal({
        title: "温馨提示",
        content: "当前还没有登录，请先登录",
        confirmText: "去登录",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) wx.navigateTo({ url: "/pages/login/index" });
          if (res.cancel && getCurrentPages().length > 1) wx.navigateBack();
          loginModal = false;
        },
      });
    }
    throw { statusCode: 0, errMsg: response.message, response };
  }

  // 其他业务错误码：提示后抛出，交由调用方 catch
  if (isPrompt) {
    wx.showToast({ title: response.message || "请求失败，请稍后再试", icon: "none" });
  }
  throw { statusCode: response.code, errMsg: response.message, response };
};

export const endInterceptor = (options: SharedTransportInfo): void => {
  if (options.load) {
    requestNum -= 1;
    if (requestNum <= 0) wx.hideLoading();
  }
};

export const errorInterceptor = (
  error: TransportError<AppResponseData> | RequestError<AppResponseData>,
): void => {
  // 业务错误已在响应拦截器中提示过，这里只兜底网络层错误
  if (error?.response) return;

  let errMsg = error?.errMsg || "";
  if (errMsg.includes("request:fail url not in domain list")) {
    errMsg = `当前API域名未添加到微信小程序授权名单 ${errMsg}`;
  } else if (
    errMsg.includes("request:fail") ||
    errMsg.includes("uploadFile:fail")
  ) {
    errMsg = "网络请求错误：请检查api地址能否访问正常";
  }
  if (errMsg) wx.showToast({ title: errMsg, icon: "none" });
};

/** 把同一组拦截器安装到任意传输实例，Request 与 Upload 通用 */
export const installTransportInterceptors = <
  T extends {
    interceptors: {
      request: { use: (fn: (options: any) => any) => void };
      response: { use: (fn: (options: any) => any) => void };
      end: { use: (fn: (options: any) => void) => void };
      error: { use: (fn: (error: any) => void) => void };
    };
  },
>(
  transport: T,
): T => {
  transport.interceptors.request.use(requestInterceptor);
  transport.interceptors.response.use(responseInterceptor);
  transport.interceptors.end.use(endInterceptor);
  transport.interceptors.error.use(errorInterceptor);
  return transport;
};
```

## request.ts：配置请求实例

```ts
// lib/request/request.ts
import { Request } from "xbd-utils/request";
import {
  baseTransportOptions,
  installTransportInterceptors,
  type AppResponseData,
} from "./shared";

const request = Request.create<AppResponseData>({
  ...baseTransportOptions,
  header: {
    "content-type": "application/json;charset=utf-8",
  },
  config: {
    ...baseTransportOptions.config,
    isFactory: true, // 由数据工厂解包响应，业务直接拿到 data
    timeoutAbort: true,
  },
});

installTransportInterceptors(request);

export default request;
```

## upload.ts：配置上传实例

```ts
// lib/request/upload.ts
import { Upload } from "xbd-utils/upload";
import { baseTransportOptions, installTransportInterceptors } from "./shared";

const fileUpload = Upload.create({
  ...baseTransportOptions,
  defaultUploadUrl: "/file/v1/picture/uploadFile",
  autoUpload: true, // 选择文件后立即上传
  maxSize: 3, // 单文件大小上限，单位 MB
  allowedExts: ["jpg", "jpeg", "png"],
});

installTransportInterceptors(fileUpload);

export default fileUpload;
```

## index.ts：统一出口并绑定 Hook

页面统一从这里导入 Hook，不直接调用 `request.post` 这类实例方法。

```ts
// lib/request/index.ts
import {
  createUsePageRequest,
  createUseRequest,
  createUseUpload,
} from "xbd-utils/hooks";
import request from "./request";
import fileUpload from "./upload";

export { request, fileUpload };

/** 普通请求 Hook */
export const useRequest = createUseRequest(request);
/** 分页请求 Hook */
export const usePageRequest = createUsePageRequest(request);
/** 上传 Hook */
export const useUpload = createUseUpload(fileUpload);
```

## 使用 useRequest

在方法内创建并解构，`fetch()` 完成后从 `state` 读取结果：

```js
// pages/profile/profile.js
import { useRequest } from "@/lib/request";
import { userApi } from "@/apis/user";

Page({
  // 获取用户信息
  async fetchUserInfo() {
    const { state, fetch } = useRequest(userApi.detail, {
      id: this.data.userId,
    });

    await fetch();
    if (state.error) return;

    this.setData({ userInfo: state.data });
  },

  // 提交：覆盖 Loading 文案
  async onSave() {
    const { state, fetch } = useRequest(
      userApi.update,
      { id: this.data.userId, name: this.data.name },
      { loadText: "保存中" },
    );

    await fetch();
    if (state.error) return;

    wx.showToast({ title: "已保存", icon: "success" });
  },
});
```

接口地址支持 `"METHOD /path"` 前缀或 `options.method`；`fetch` 可追加参数与初始参数合并；页面卸载时中断请求：

```js
onUnload() {
  this.profileRequest?.cancel();
},
```

`state` 提供 `code`、`data`、`message`、`loading`、`error`。

## 使用 usePageRequest

`usePageRequest` 会自动追加 `current`、`size`，并按响应更新列表与是否还有更多。

```js
// pages/order-list/order-list.js
import { usePageRequest } from "@/lib/request";
import { orderApi } from "@/apis/order";

Page({
  pager: null,

  onLoad() {
    // 初始参数支持函数，请求时才取值
    this.pager = usePageRequest(
      orderApi.page,
      () => ({ status: this.data.status }),
      { loadText: "加载中" },
      { current: 1, size: 10 },
    );

    this.fetchList();
  },

  async fetchList() {
    const { state } = this.pager;
    await this.pager.fetch();
    if (state.error) return;

    this.setData({ list: state.record });
  },

  // 触底加载下一页
  async onReachBottom() {
    const { state } = this.pager;
    await this.pager.loadMore();
    if (state.error) return;

    this.setData({ list: state.record });
  },

  // 下拉刷新：重置回第一页
  async onPullDownRefresh() {
    await this.pager.refresh();
    wx.stopPullDownRefresh();
  },
});
```

`state` 提供 `record`、`total`、`hasMore`、`loading`、`code`、`message`、`error`；方法提供 `fetch`、`loadMore`、`next`、`refresh`、`reset`、`cancel`。

## 使用 useUpload

```js
// pages/avatar/avatar.js
import { useUpload } from "@/lib/request";

Page({
  async onChooseAvatar() {
    const { state, chooseMedia } = useUpload({
      maxSize: 3,
      allowedExts: ["jpg", "jpeg", "png"],
      onSuccess: ({ response }) => {
        this.setData({ avatarUrl: response.url });
      },
      onError: ({ error }) => {
        console.error("上传失败", error);
      },
    });

    // 选择成功后按实例配置自动上传
    await chooseMedia({
      count: 1,
      mediaType: ["image"],
      onProgress: ({ progress }) => {
        console.log("上传进度", progress);
      },
    });

    console.log(state.status, state.progress);
  },
});
```

已有临时文件时直接上传：

```js
const { upload: runUpload } = useUpload();

const response = await runUpload({
  files: [{ path: tempFilePath, size: fileSize, taskId: "avatar" }],
});
```

从聊天会话选择文件用 `chooseMessageFile`；`state` 提供 `status`、`progress`、`files`、`response`、`loading`、`error`。

## 注意事项

- **不要把 Token 固定在实例配置里**。登录态会变化，统一在请求拦截器中每次读取；`Request` 与 `Upload` 共用同一拦截器后行为一致。
- **Loading 用计数管理**。并发请求只显示一次 Loading，全部结束才隐藏；单次请求不需要 Loading 时传 `load: false`。
- **回调使用箭头函数**。直接传依赖 `this` 的普通方法会丢失页面上下文，需用箭头函数包装或 `bind(this)`。
- **上传/请求地址来自当前环境配置**。切换环境后 `@/config` 的 `baseUrl` 会随之变化，业务代码不需要改动。
