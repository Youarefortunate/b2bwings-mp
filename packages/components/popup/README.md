# Popup 弹出层

[组件索引](../README.md) · [首页](../../../README.md)

> 用于从屏幕边缘或中心弹出内容，并可展示内置遮罩层

## 何时使用

- 需要承载弹窗、抽屉、底部操作面板等浮层内容
- 需要通过遮罩阻断背景交互
- 需要在不引入独立遮罩组件的情况下实现弹层遮罩

## 基础用法

### 1. 注册组件 (JSON)

```json
{
  "usingComponents": {
    "xbd-popup": "xbd-miniprogram/popup/popup"
  }
}
```

### 2. 基础弹出层 (WXML)

```xml
<xbd-popup visible="{{ visible }}" placement="bottom" bind:visible-change="onVisibleChange">
  <view class="popup-content">弹出层内容</view>
</xbd-popup>
```

```javascript
Component({
  data: {
    visible: false,
  },
  methods: {
    onVisibleChange(event) {
      this.setData({ visible: event.detail.visible });
    },
  },
});
```

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `close-btn` | 是否显示关闭按钮 | Boolean | `false` |
| `close-icon-props` | 默认关闭按钮的属性配置，仅在 `close-btn` 为 `true` 且未使用 `close-btn` 插槽时有效 | Object | `{}` |
| `close-on-overlay-click` | 点击遮罩层是否关闭 | Boolean | `true` |
| `content` | 浮层内容 | String | `-` |
| `custom-header` | 是否使用完整自定义头部插槽 | Boolean | `false` |
| `custom-header-title` | 是否使用自定义头部标题插槽 | Boolean | `false` |
| `custom-header-close` | 是否使用自定义头部关闭图标插槽 | Boolean | `false` |
| `header-title` | 头部标题 | String | `-` |
| `header-subtitle` | 头部副标题 | String | `-` |
| `header-align` | 头部标题对齐方式，可选值为 `left` / `center` / `right` | String | `left` |
| `header-border` | 是否显示头部分割线 | Boolean | `true` |
| `header-close-position` | 头部关闭图标位置，可选值为 `left` / `right` | String | `right` |
| `show-header` | 是否显示内置头部 | Boolean | `false` |
| `duration` | 动画过渡时间，单位毫秒 | Number | `240` |
| `overlay-props` | 内置遮罩层配置 | Object | `{}` |
| `placement` | 弹出位置，可选值为 `top` / `left` / `right` / `bottom` / `center` | String | `top` |
| `prevent-scroll-through` | 是否阻止背景滚动 | Boolean | `true` |
| `show-overlay` | 是否显示遮罩层 | Boolean | `true` |
| `visible` | 是否显示浮层 | Boolean | `null` |
| `default-visible` | 非受控默认显示状态 | Boolean | `-` |
| `using-custom-navbar` | 是否使用自定义导航栏 | Boolean | `false` |
| `custom-navbar-height` | 自定义导航栏高度，单位 px | Number | `0` |
| `z-index` | 浮层层级 | Number | `11500` |

### OverlayProps (内置遮罩配置)

| 字段名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `zIndex` | 遮罩层级 | Number | `zIndex - 1` |
| `duration` | 遮罩动画时长，单位毫秒 | Number | `duration` |
| `backgroundColor` | 遮罩背景色 | String | `rgba(0, 0, 0, 0.6)` |
| `style` | 遮罩内联样式 | String | `-` |
| `customStyle` | 遮罩自定义样式 | String | `-` |
| `preventScrollThrough` | 是否阻止背景滚动 | Boolean | `false` |

### Events (事件)

| 事件名 | 说明 | 参数 |
| :--- | :--- | :--- |
| `visible-change` | 显示状态变化时触发 | `{ visible, trigger }` |

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `default` | 默认内容 |
| `content` | 内容插槽 |
| `header` | 完整自定义头部插槽，需同时设置 `custom-header` |
| `header-title` | 自定义头部标题插槽，需同时设置 `custom-header-title` |
| `header-close` | 自定义头部关闭图标插槽，需同时设置 `custom-header-close` |
| `close-btn` | 关闭按钮插槽，仅在未显示内置头部时使用 |

### External Classes (外部样式类)

| 类名 | 说明 |
| :--- | :--- |
| `xbd-class` | 根节点样式类 |
| `xbd-class-content` | 内容区样式类 |
| `xbd-class-header` | 头部根节点样式类 |
| `xbd-class-header-body` | 头部标题区域样式类 |
| `xbd-class-header-title` | 头部标题样式类 |
| `xbd-class-header-subtitle` | 头部副标题样式类 |
| `xbd-class-header-close` | 头部关闭图标区域样式类 |
