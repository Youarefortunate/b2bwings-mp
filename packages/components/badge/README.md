# Badge 徽标

[组件索引](../README.md) · [首页](../../../README.md)

> 用于告知用户当前区域的状态变化或待处理任务数量

## 何时使用

- 需要在图标、按钮、卡片等元素右上角展示消息数量
- 需要通过红点提示用户存在未读、更新或待处理状态
- 需要在局部区域展示角标、气泡或自定义文本标识

## 基础用法

### 1. 注册组件 (JSON)

可以在页面或组件的 `index.json` 中局部注册，或在全局 `app.json` 中注册

```json
{
  "usingComponents": {
    "xbd-badge": "xbd-miniprogram/badge/badge"
  }
}
```

### 2. 红点徽标 (WXML)

```xml
<xbd-badge dot>
  <xbd-icon name="chevron-right" size="48rpx" />
</xbd-badge>
```

### 3. 数字徽标 (WXML)

```xml
<xbd-badge count="8" offset="{{ [2, -2] }}">
  <xbd-button content="消息" />
</xbd-badge>
```

### 4. 自定义徽标内容 (WXML)

```xml
<xbd-badge count="NEW" shape="bubble">
  <xbd-button content="活动" />
</xbd-badge>
```

---

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `color` | 徽标颜色 | String | `''` |
| `content` | 徽标包裹内容，未传入时渲染默认插槽 | String | `''` |
| `count` | 徽标内容，可以是数字、文本；传入 `null` 时使用 `count` 插槽 | String / Number / Null | `0` |
| `dot` | 是否为红点徽标 | Boolean | `false` |
| `max-count` | 数字封顶值 | Number | `99` |
| `offset` | 徽标位置偏移，格式如 `[2, -2]` 或 `['2rpx', '-2rpx']` | Array | `[]` |
| `shape` | 徽标形状，可选项：`circle` / `square` / `bubble` / `ribbon` / `ribbon-right` / `ribbon-left` / `triangle-right` / `triangle-left` | String | `circle` |
| `show-zero` | `count` 为 `0` 时是否显示徽标 | Boolean | `false` |
| `size` | 徽标尺寸，可选项：`medium` / `large` | String | `medium` |

### Events (事件)

该组件不向外直接触发业务事件

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `default` | 徽标包裹内容 |
| `count` | 自定义徽标内容，仅在 `count` 为 `{{ null }}` 时展示 |

### External Classes (外部样式类)

| 类名 | 说明 |
| :--- | :--- |
| `xbd-class` | 根节点样式类 |
| `xbd-class-count` | 徽标节点样式类 |
| `xbd-class-content` | 内容节点样式类 |

### Methods (方法)

该组件不向外直接暴露供实例调用的公共 Methods

### Type Definitions (类型定义)

```typescript
export type BadgeCount = string | number | null;

export type BadgeOffset = Array<string | number>;

export type BadgeShape =
  | "circle"
  | "square"
  | "bubble"
  | "ribbon"
  | "ribbon-right"
  | "ribbon-left"
  | "triangle-right"
  | "triangle-left";

export type BadgeSize = "medium" | "large";
```

### CSS Variables

| 名称 | 默认值 | 描述 |
| :--- | :--- | :--- |
| `--xbd-badge-text-color` | `$font-white-1` | 徽标文字颜色 |
| `--xbd-badge-content-text-color` | `$font-gray-1` | 内容文字颜色 |
| `--xbd-badge-content-text-font` | `$font-body-large` | 内容文字字体 |
| `--xbd-badge-bg-color` | `$error-color-6` | 徽标背景色 |
| `--xbd-badge-font` | `$font-mark-extraSmall` | 徽标字体 |
| `--xbd-badge-basic-height` | `32rpx` | 默认徽标高度 |
| `--xbd-badge-basic-width` | `32rpx` | 默认徽标最小宽度 |
| `--xbd-badge-basic-padding` | `8rpx` | 默认徽标内边距 |
| `--xbd-badge-border-radius` | `4rpx` | 默认徽标圆角 |
| `--xbd-badge-bubble-border-radius` | `20rpx 20rpx 20rpx 2rpx` | 气泡徽标圆角 |
| `--xbd-badge-dot-size` | `16rpx` | 红点尺寸 |
| `--xbd-badge-large-font` | `$font-mark-small` | 大尺寸徽标字体 |
| `--xbd-badge-large-height` | `40rpx` | 大尺寸徽标高度 |
| `--xbd-badge-large-padding` | `10rpx` | 大尺寸徽标内边距 |
