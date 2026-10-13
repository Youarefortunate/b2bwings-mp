# Modal 模态框 (xbd-modal)

用于展示重要提示、确认操作或少量自定义内容，会打断当前页面操作流程。

## 何时使用

- 需要用户确认关键操作时。
- 需要展示必须阅读的重要提示时。
- 需要通过命令式 API 快速唤起确认框或操作项时。

## 基础用法

### 1. 注册组件 (JSON)

```json
{
  "usingComponents": {
    "xbd-modal": "xbd-miniprogram/modal/modal",
    "xbd-button": "xbd-miniprogram/button/button"
  }
}
```

### 2. 声明式用法 (WXML)

```xml
<xbd-button bind:tap="showModal" content="打开模态框" />

<xbd-modal
  visible="{{ visible }}"
  title="模态框标题"
  content="告知当前状态、信息和解决方法等内容"
  confirm-btn="确定"
  cancel-btn="取消"
  bind:confirm="closeModal"
  bind:cancel="closeModal"
/>
```

```javascript
Component({
  data: {
    visible: false,
  },

  methods: {
    showModal() {
      this.setData({ visible: true });
    },

    closeModal() {
      this.setData({ visible: false });
    },
  },
});
```

### 3. 命令式用法

页面中保留一个带默认 `id` 的组件实例：

```xml
<xbd-modal id="xbd-modal" />
```

```javascript
import Modal from "xbd-miniprogram/modal/index";

Component({
  methods: {
    showModal() {
      Modal.confirm({
        context: this,
        title: "模态框标题",
        content: "告知当前状态、信息和解决方法等内容",
        confirmBtn: "确定",
        cancelBtn: "取消",
      });
    },
  },
});
```

命令式方法默认使用选择器 `#xbd-modal`，如需使用其他实例，可传入 `selector`。

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `actions` | 操作按钮列表，设置后用于渲染多操作项 | Array | - |
| `button-layout` | 多按钮排列方式，可选值为 `horizontal` / `vertical` | String | `horizontal` |
| `cancel-btn` | 取消按钮配置，字符串表示按钮文案，对象会透传给 `xbd-button`，`null` 或空值不显示 | String / Object / null | - |
| `close-btn` | 是否显示关闭按钮，`true` 显示默认关闭按钮，对象表示关闭图标配置 | Boolean / Object | `false` |
| `close-on-overlay-click` | 点击遮罩层时是否触发关闭 | Boolean | `false` |
| `confirm-btn` | 确认按钮配置，字符串表示按钮文案，对象会透传给 `xbd-button`，`null` 或空值不显示 | String / Object / null | - |
| `content` | 模态框内容 | String | - |
| `overlay-props` | 内置遮罩层配置 | Object | `{}` |
| `prevent-scroll-through` | 是否阻止背景滚动穿透 | Boolean | `true` |
| `show-overlay` | 是否显示遮罩层 | Boolean | `true` |
| `title` | 模态框标题 | String | - |
| `using-custom-navbar` | 是否使用自定义导航栏 | Boolean | `false` |
| `visible` | 是否显示模态框 | Boolean | - |
| `z-index` | 模态框层级 | Number | `11500` |

### Command Methods (命令式方法)

| 方法名 | 说明 | 参数 | 返回值 |
| :--- | :--- | :--- | :--- |
| `Modal.alert` | 打开只有确认按钮的提示框 | `options` | Promise |
| `Modal.confirm` | 打开确认框 | `options` | Promise |
| `Modal.close` | 关闭指定实例 | `options` | Promise |
| `Modal.action` | 打开多操作项模态框 | `options` | `Promise<{ index: number }>` |

### Command Options (命令式参数)

| 字段名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `context` | 当前页面或组件实例 | Object | - |
| `selector` | 模态框组件选择器 | String | `#xbd-modal` |
| `title` | 模态框标题 | String | `''` |
| `content` | 模态框内容 | String | `''` |
| `zIndex` | 模态框层级 | Number | - |
| `cancelBtn` | 取消按钮配置 | String / Object | - |
| `confirmBtn` | 确认按钮配置 | String / Object | - |
| `actions` | 多操作项列表，仅 `Modal.action` 使用 | Array | `[]` |
| `buttonLayout` | 多按钮排列方式 | String | `horizontal` |
| `showOverlay` | 是否显示遮罩层 | Boolean | `true` |
| `closeOnOverlayClick` | 点击遮罩层时是否关闭 | Boolean | `false` |
| `preventScrollThrough` | 是否阻止背景滚动穿透 | Boolean | `true` |

### Events (事件)

| 事件名 | 说明 | 回调参数 |
| :--- | :--- | :--- |
| `confirm` | 点击确认按钮时触发 | - |
| `cancel` | 点击取消按钮时触发 | - |
| `close` | 点击取消、关闭按钮或允许点击遮罩关闭时触发 | `{ trigger }` |
| `overlay-click` | 点击遮罩层时触发 | - |
| `action` | 点击 `actions` 中的操作项时触发 | `{ index }` |
| `open-type-event` | 按钮开放能力调用成功时触发 | `event.detail` |
| `open-type-error-event` | 按钮开放能力调用失败时触发 | `event.detail` |

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `top` | 模态框顶部内容 |
| `title` | 自定义标题内容 |
| `content` | 自定义正文内容 |
| `middle` | 正文与底部操作区之间的内容 |
| `actions` | 自定义操作区内容 |
| `cancel-btn` | 自定义取消按钮 |
| `confirm-btn` | 自定义确认按钮 |

### External Classes (外部样式类)

| 类名 | 说明 |
| :--- | :--- |
| `class` | 默认外部样式类 |
| `xbd-class` | 模态框根节点样式类 |
| `xbd-class-content` | 内容区样式类 |
| `xbd-class-confirm` | 确认按钮样式类 |
| `xbd-class-cancel` | 取消按钮样式类 |
| `xbd-class-action` | 多操作项按钮样式类 |
