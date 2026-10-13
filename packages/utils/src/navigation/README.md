# navigation 路由跳转

## 工具列表

| 工具 | 作用描述 |
| :--- | :--- |
| **`navigator.navTo`** | **统一跳转方法**：支持单参数对象写法和三参数写法，可指定 `navigateTo`、`redirectTo`、`reLaunch`、`switchTab`、`navigateBack`。 |
| **`navigator.setTabBarLinks`** | **设置 tabBar 页面列表**：用于让 `navTo` 自动识别 tabBar 页面并改用 `switchTab`。 |
| **`navigator.getTabBarLinks`** | **读取 tabBar 页面列表**：用于获取当前已注册的 tabBar 页面路径。 |

## 特性说明

| 特性 | 作用描述 |
| :--- | :--- |
| **复杂参数处理** | **对象 / 数组参数传递**：`navTo` 会处理非空对象和数组参数，页面侧可通过封装逻辑恢复参数。 |
| **web-view URL 编码** | **web-view 跳转处理**：跳转到白名单 web-view 页面时，会自动处理 `query.url` 编码。当前 web-view 页面路径仍是固定白名单，后续需要完善为可配置能力。 |

## navigator.navTo

### 函数签名

```ts
navigator.navTo(
  options: NavigatorOptions,
): void

navigator.navTo(
  url: string,
  query?: NavigatorQuery,
  options?: Omit<NavigatorOptions, "url" | "query">,
): void
```

### 参数列表

| 参数 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `url` | 跳转路径，可以带 `/`，也可以不带 `/`。 | - |
| `query` | 跳转参数对象，会拼接到 URL 后。对象、数组等复杂参数会走深层参数逻辑。 | `{}` |
| `modo` | 跳转方式，支持 `navigateTo`、`redirectTo`、`reLaunch`、`switchTab`、`navigateBack`。 | `navigateTo` |
| `delay` | 延迟跳转时间，单位毫秒。 | `0` |
| `webViewBaseUrl` | web-view 基础 URL，用于拼接非完整链接。 | - |
| `delta` | `navigateBack` 返回层级。 | `1` |

### 单参数对象写法

```ts
import { navigator } from "xbd-utils";

navigator.navTo({
  url: "pages/operator-manager/operator-manager",
  query: {
    id: "10001",
  },
});
```

### 三参数写法

```ts
import { navigator } from "xbd-utils";

navigator.navTo(
  "pages/operator-manager/operator-manager",
  {
    id: "10001",
  },
  {
    modo: "navigateTo",
  },
);
```

### 切换跳转方式

```ts
navigator.navTo({
  url: "pages/operator-manager/operator-manager",
  query: {
    id: "10001",
  },
  modo: "redirectTo",
});
```

### 返回上一页

```ts
navigator.navTo({
  modo: "navigateBack",
  delta: 1,
});
```

## navigator.setTabBarLinks

### 函数签名

```ts
navigator.setTabBarLinks(links: string[]): void
```

### 参数列表

| 参数 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `links` | tabBar 页面路径列表。 | `[]` |

### 基础用法

```ts
import { navigator } from "xbd-utils";

navigator.setTabBarLinks([
  "pages/home/home",
  "pages/mine/mine",
]);

navigator.navTo({
  url: "pages/home/home",
});
```

## navigator.getTabBarLinks

### 函数签名

```ts
navigator.getTabBarLinks(): string[]
```

### 基础用法

```ts
const tabBarLinks = navigator.getTabBarLinks();
```

## 复杂参数传递

```ts
navigator.navTo({
  url: "pages/detail/detail",
  query: {
    id: "10001",
    filter: {
      status: "enabled",
      tags: ["new", "hot"],
    },
  },
});
```

## web-view URL 编码

> TODO：当前 web-view 页面路径仍是固定白名单，后续需要完善为可配置能力。

```ts
navigator.navTo({
  url: "pages/web-view/web-view",
  query: {
    url: "https://example.com/detail?id=10001",
  },
});
```

如果传入的 `query.url` 不是完整链接，可通过 `webViewBaseUrl` 拼接基础地址。

```ts
navigator.navTo({
  url: "pages/web-view/web-view",
  query: {
    url: "/notice/detail?id=10001",
  },
  webViewBaseUrl: "https://example.com",
});
```
