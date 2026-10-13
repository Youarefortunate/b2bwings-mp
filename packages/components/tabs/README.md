# Tabs 选项卡

> 用于内容分类后的展示切换

## 何时使用

- 需要对同一层级内容进行分类展示
- 需要在不同内容面板之间切换
- 需要结合 `tab-item` 承载每个选项卡内容

## 基础用法

### 1. 注册组件 (JSON)

```json
{
  "usingComponents": {
    "xbd-tabs": "xbd-miniprogram/tabs/tabs",
    "xbd-tab-item": "xbd-miniprogram/tab-item/tab-item"
  }
}
```

### 2. 基础选项卡 (WXML)

```xml
<xbd-tabs defaultValue="0" bind:change="onTabsChange">
  <xbd-tab-item label="选项一" value="0">选项一内容</xbd-tab-item>
  <xbd-tab-item label="选项二" value="1">选项二内容</xbd-tab-item>
</xbd-tabs>
```

### 3. 受控用法 (WXML)

```xml
<xbd-tabs value="{{ value }}" bind:change="onTabsChange">
  <xbd-tab-item label="选项一" value="0" />
  <xbd-tab-item label="选项二" value="1" />
</xbd-tabs>
```

```javascript
Component({
  data: {
    value: "0",
  },
  methods: {
    onTabsChange(event) {
      this.setData({ value: event.detail.value });
    },
  },
});
```

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `animation` | 动画效果设置，其中 `duration` 表示动画时长，单位秒 | Object | `-` |
| `bottom-line-mode` | 激活下划线的模式，可选值为 `fixed` / `auto` / `full` | String | `fixed` |
| `show-bottom-line` | 是否展示底部激活线条 | Boolean | `true` |
| `space-evenly` | 选项卡头部空间是否均分 | Boolean | `true` |
| `split` | 是否展示分割线 | Boolean | `true` |
| `sticky` | 是否开启粘性布局 | Boolean | `false` |
| `sticky-props` | 透传至 Sticky 组件 | Object | `-` |
| `swipeable` | 是否可以滑动切换 | Boolean | `true` |
| `theme` | 标签样式，可选值为 `line` / `tag` / `segment` | String | `line` |
| `value` | 激活的选项卡值 | String / Number | `null` |
| `default-value` | 激活的选项卡默认值，非受控属性 | String / Number | `-` |
| `magical` | 是否开启滑块神奇弹性过渡效果（**注：该效果仅在分段器样式 `theme="segment"` 下生效**） | Boolean | `false` |

### TabItem Attributes (面板属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `badge-props` | 透传至 Badge 组件 | Object | `{}` |
| `disabled` | 是否禁用当前选项卡 | Boolean | `false` |
| `icon` | 图标，字符串表示图标名称，对象透传至 Icon 组件 | String / Object | `-` |
| `label` | 选项卡名称 | String | `''` |
| `lazy` | 是否启用选项卡懒加载 | Boolean | `false` |
| `panel` | 用于自定义选项卡面板内容 | String | `-` |
| `value` | 选项卡的值，唯一标识 | String / Number | `-` |

### Events (事件)

| 事件名 | 说明 | 参数 |
| :--- | :--- | :--- |
| `change` | 激活选项卡发生变化时触发 | `{ value, label }` |
| `click` | 点击选项卡时触发 | `{ value, label }` |
| `scroll` | 粘性布局滚动时触发 | Sticky 滚动事件参数 |
| `error` | 内部计算选项卡位置异常时触发 | Error |

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `default` | 默认内容，用于放置 `xbd-tab-item` |
| `middle` | 选项卡头部与内容区域之间的自定义内容 |

### External Classes (外部样式类)

| 类名 | 说明 |
| :--- | :--- |
| `xbd-class` | 根节点样式类 |
| `xbd-class-item` | 选项卡项样式类 |
| `xbd-class-active` | 激活选项卡样式类 |
| `xbd-class-track` | 激活线样式类 |
| `xbd-class-content` | 内容区样式类 |
