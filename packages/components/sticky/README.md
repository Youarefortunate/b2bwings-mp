# Sticky 吸顶容器

> 用于常驻页面顶部的信息、操作展示

## 何时使用

- 需要将关键操作（例如付款按钮、筛选项等）常驻固定在屏幕顶端或底端以方便操作
- 具有长列表页面，需要保持分类标题或列表表头常驻页面顶部

## 基础用法

### 1. 注册组件 (JSON)

可以在页面或组件的 `index.json` 中注册

```json
{
  "usingComponents": {
    "xbd-sticky": "xbd-miniprogram/sticky/sticky",
    "xbd-button": "xbd-miniprogram/button/button"
  }
}
```

### 2. 基础吸顶 (WXML)

```xml
<xbd-sticky>
  <xbd-button theme="primary">基础吸顶</xbd-button>
</xbd-sticky>
```

### 3. 吸顶距离 (WXML)

```xml
<xbd-sticky offset-top="{{ 40 }}">
  <xbd-button theme="danger">吸顶距离 40px</xbd-button>
</xbd-sticky>
```

---

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `container` | 函数返回容器对应的 NodesRef 节点，将对应节点指定为组件的外部容器，滚动时组件会始终保持在容器范围内，当组件即将超出容器底部时，会返回原位置 | Function | `-` |
| `disabled` | 是否禁用组件 | Boolean | `false` |
| `offset-top` | 吸顶时与顶部的距离，单位 rpx 或 px | String / Number | `0` |
| `z-index` | 吸顶时的 z-index | Number | `99` |

### Events (事件)

| 事件名 | 说明 | 参数 |
| :--- | :--- | :--- |
| `scroll` | 滚动时触发 | `(detail: { scrollTop: number, isFixed: boolean })` |

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `default` | 默认插槽，自定义吸顶区域内容 |

### External Classes (外部样式类)

| 类名 | 说明 |
| :--- | :--- |
| `xbd-class` | 根节点样式类 |
| `xbd-class-content` | 内容节点样式类 |

### Methods (方法)

该组件不向外直接暴露供实例调用的公共 Methods
