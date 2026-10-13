# Empty 空状态

用于在列表、搜索结果、页面内容为空时展示占位说明，帮助用户理解当前没有可展示的数据。

## 何时使用

- 页面或模块暂无数据，需要给出明确空状态提示时。
- 搜索、筛选后没有匹配结果，需要提示用户调整条件时。
- 需要用图标、图片或自定义操作引导用户继续处理时。

## 基础用法

### 1. 注册组件 (JSON)

```json
{
  "usingComponents": {
    "xbd-empty": "xbd-miniprogram/empty/empty"
  }
}
```

### 2. 图标空状态 (WXML)

```xml
<xbd-empty icon="close-circle-fill" description="暂无数据" />
```

### 3. 图片空状态 (WXML)

```xml
<xbd-empty image="https://example.com/empty.png" description="暂无内容" />
```

### 4. 自定义操作区 (WXML)

```xml
<xbd-empty icon="close-circle-fill" description="暂无订单">
  <xbd-button slot="action" theme="primary" content="去下单" />
</xbd-empty>
```

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `description` | 空状态描述文字 | String | - |
| `icon` | 图标名称或图标配置对象，字符串表示图标名称，对象会透传给 `xbd-icon` | String / Object | - |
| `image` | 空状态图片地址，优先级高于 `icon` | String | - |

### Events (事件)

该组件不向外直接触发业务事件。

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `image` | 自定义图片或图标区域内容 |
| `description` | 自定义描述内容 |
| `action` | 自定义底部操作内容 |

### External Classes (外部样式类)

| 类名 | 说明 |
| :--- | :--- |
| `xbd-class` | 根节点样式类 |
| `xbd-class-image` | 图片或图标区域样式类 |
| `xbd-class-description` | 描述区域样式类 |
| `xbd-class-actions` | 操作区域样式类 |

### Methods (方法)

该组件不向外直接暴露供实例调用的公共 Methods。
