# Icon 图标 (xbd-icon)

用于展示图标，支持项目内置字体图标、自定义类名前缀图标以及外部图片链接。

## 何时使用

- 需要在页面中渲染标识、状态或者图形元素时。
- 按钮、输入框、导航栏等组件内需要添加图标点缀的场景。

## 基础用法

### 1. 注册组件 (JSON)

```json
{
  "usingComponents": {
    "xbd-icon": "xbd-miniprogram/icon/icon"
  }
}
```

### 2. 基础使用 (WXML)

```xml
<xbd-icon name="close-linear" size="40rpx" color="#999999" />
```

### 3. 使用图片资源路径

当 `name` 属性为 `http` / `https` 网络链接、协议相对链接、绝对路径或相对路径，并且包含常见图片后缀（`jpg`、`jpeg`、`png`、`svg`、`webp`、`gif`）时，组件会将其识别为图片资源路径，渲染出对应的图片。

```xml
<xbd-icon name="https://example.com/logo.png" size="48rpx" />
<xbd-icon name="/assets/logo.webp" size="48rpx" />
<xbd-icon name="./logo.svg" size="48rpx" />
```

### 4. 使用自定义图标前缀

如果需要使用第三方图标库（如 iconfont 等），可以通过设置 `prefix` 属性来传入自定义类名前缀。

```xml
<xbd-icon prefix="xbd" name="gongshangyinhang" size="36rpx" />
```

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `name` | 图标名称或图片链接 | String | `''` |
| `color` | 图标颜色 | String | `''` |
| `size` | 图标大小，如 `'48rpx'`、`'24px'` | String / Number | `''` |
| `prefix` | 自定义图标前缀 | String | `''` |

### Events (事件)

| 事件名 | 说明 | 回调参数 |
| :--- | :--- | :--- |
| `click` | 点击图标时触发 | `event.detail` (空) |

### Type Definitions (类型定义)

```typescript
export interface IconProps {
  /**
   * 图标颜色
   * @default ''
   */
  color?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 图标名称或图片链接
   * @default ''
   */
  name: {
    type: StringConstructor;
    value?: string;
    required?: boolean;
  };
  /**
   * 自定义图标前缀
   * @default ''
   */
  prefix?: {
    type: StringConstructor;
    value?: string;
  };
  /**
   * 图标大小
   */
  size?: {
    type: null;
    value?: string | number;
  };
}
```
