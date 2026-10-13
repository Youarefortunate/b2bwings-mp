# Input 输入框

> 用于单行文本信息输入

## 何时使用

- 需要用户输入单行文本、数字、密码等场景
- 表单录入和搜索框场景

## 基础用法

### 1. 注册组件 (JSON)

可以在页面或组件的 `index.json` 中局部注册，或在全局 `app.json` 中注册

```json
{
  "usingComponents": {
    "xbd-input": "xbd-miniprogram/input/input"
  }
}
```

### 2. 基础使用 (WXML)

展示最核心的单行文本输入框，大括号内保留空格

```xml
<xbd-input value="{{ value }}" placeholder="请输入内容" />
```

### 3. 带前置标签与清除按钮 (WXML)

```xml
<xbd-input
  label="手机号"
  value="{{ phoneNumber }}"
  placeholder="请输入手机号"
  clearable
  bind:change="onPhoneChange"
/>
```

```typescript
Page({
  data: {
    phoneNumber: '',
  },
  onPhoneChange(e: WechatMiniprogram.Input) {
    this.setData({
      phoneNumber: e.detail.value,
    });
  },
});
```

---

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `adjust-position` | 键盘弹起时是否自动上推页面 | Boolean | `true` |
| `align` | 文本内容位置，居左/居中/居右。可选项：`left` / `center` / `right` | String | `left` |
| `allow-input-over-max` | 超出 `maxlength` 或 `maxcharacter` 之后是否允许继续输入 | Boolean | `false` |
| `always-embed` | 强制 input 处于同层状态，默认 focus 时 input 会切到非同层状态，仅在 iOS 下生效 | Boolean | `false` |
| `auto-focus` | 自动聚焦，拉起键盘，即将废弃，请直接使用 `focus` | Boolean | `false` |
| `borderless` | 是否开启无边框模式 | Boolean | `false` |
| `clear-trigger` | 清空图标触发方式，仅在输入框有值时有效。可选项：`always` / `focus` | String | `always` |
| `clearable` | 是否可清空，值为 `true` 表示使用默认清空按钮，值为 `Object` 表示透传至 `icon` | Boolean / Object | `false` |
| `confirm-hold` | 点击键盘右下角按钮时是否保持键盘不收起 | Boolean | `false` |
| `confirm-type` | 设置键盘右下角按钮的文字，可选项：`send` / `search` / `next` / `go` / `done` | String | `done` |
| `cursor` | 指定 focus 时的光标位置 | Number | `-1` |
| `cursor-color` | 光标颜色。iOS 下为十六进制颜色值，安卓下只支持 `default` 和 `green` | String | `#0052d9` |
| `cursor-spacing` | 指定光标与键盘的距离 | Number | `0` |
| `disabled` | 是否禁用输入框 | Boolean | `undefined` |
| `focus` | 是否获取焦点 | Boolean | `false` |
| `format` | 指定输入框展示值的格式 | Function | - |
| `hold-keyboard` | focus 时点击页面的时候不收起键盘 | Boolean | `false` |
| `label` | 左侧文本 | String | - |
| `layout` | 标题输入框布局方式。可选项：`vertical` / `horizontal` | String | `horizontal` |
| `maxcharacter` | 用户最多可以输入的字符个数，一个中文汉字表示两个字符长度，与 `maxlength` 二选一使用 | Number | - |
| `maxlength` | 用户最多可以输入的文本长度，一个中文等于一个计数长度，默认为 -1 不限制，与 `maxcharacter` 二选一使用 | Number | `-1` |
| `placeholder` | 占位符 | String | `undefined` |
| `placeholder-class` | 指定 placeholder 的样式类 | String | `input-placeholder` |
| `placeholder-style` | 指定 placeholder 的样式 | String | - |
| `prefix-icon` | 组件前置图标，值为字符串表示图标名称，值为 `Object` 类型表示透传至 `icon` | String / Object | - |
| `readonly` | 只读状态 | Boolean | `undefined` |
| `safe-password-cert-path` | 安全键盘加密公钥的路径，只支持包内路径 | String | - |
| `safe-password-custom-hash` | 安全键盘计算 hash 的算法表达式 | String | - |
| `safe-password-length` | 安全键盘输入密码长度 | Number | - |
| `safe-password-nonce` | 安全键盘加密盐值 | String | - |
| `safe-password-salt` | 安全键盘计算 hash 盐值，若指定 `custom-hash` 则无效 | String | - |
| `safe-password-time-stamp` | 安全键盘加密时间戳 | Number | - |
| `selection-end` | 光标结束位置，自动聚集时有效，需与 `selection-start` 搭配使用 | Number | `-1` |
| `selection-start` | 光标起始位置，自动聚集时有效，需与 `selection-end` 搭配使用 | Number | `-1` |
| `status` | 输入框状态。可选项：`default` / `success` / `warning` / `error` | String | `default` |
| `suffix` | 后置图标前的后置内容 | String | - |
| `suffix-icon` | 后置文本内容，值为字符串表示图标名称，值为 `Object` 类型表示透传至 `icon` | String / Object | - |
| `tips` | 输入框下方提示文本，会根据不同的 `status` 呈现不同的样式 | String | - |
| `type` | 输入框类型。可选项：`text` / `number` / `idcard` / `digit` / `safe-password` / `password` / `nickname` | String | `text` |
| `value` | 输入框的值 | String / Number | - |
| `default-value` | 输入框的默认值，非受控属性 | String / Number | `undefined` |

### Events (事件)

| 事件名 | 说明 | 回调参数 |
| :--- | :--- | :--- |
| `blur` | 失去焦点时触发 | `(e: WechatMiniprogram.InputBlur)` |
| `change` | 输入框值发生变化时触发 | `(e: WechatMiniprogram.Input)` |
| `clear` | 清空按钮点击时触发 | `(e: WechatMiniprogram.CustomEvent)` |
| `click` | 点击事件，参数 `trigger` 表示触发源 | `(detail: { trigger: 'suffix' \| 'suffix-icon' })` |
| `enter` | 回车键按下时触发 | `(e: WechatMiniprogram.InputConfirm)` |
| `focus` | 获得焦点时触发 | `(e: WechatMiniprogram.InputFocus)` |
| `keyboardheightchange` | 键盘高度发生变化的时候触发此事件 | `(e: WechatMiniprogram.InputKeyboardHeightChange)` |
| `nicknamereview` | 用户昵称审核完毕后触发，仅在 `type` 为 `nickname` 时有效 | `(e: WechatMiniprogram.CustomEvent)` |

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `extra` | 右侧额外内容 |
| `label` | 自定义 `label` 显示内容 |
| `prefix-icon` | 组件前置图标 |
| `suffix` | 自定义 `suffix` 显示内容 |
| `suffix-icon` | 后置文本图标 |
| `tips` | 输入框下方提示内容 |

### Methods (方法)

该组件不向外直接暴露供实例调用的公共 Methods

### Type Definitions (类型定义)

```typescript
export type InputFormatType = (value: InputValue) => string;

export type InputValue = string | number;
```

### CSS Variables

| 名称 | 默认值 | 描述 |
| :--- | :--- | :--- |
| `--xbd-input-align-items` | `center` | 内容对齐方式 |
| `--xbd-input-bg-color` | `$bg-color-container` | 背景颜色 |
| `--xbd-input-border-color` | `$component-stroke` | 边框线颜色 |
| `--xbd-input-border-left-space` | `32rpx` | 底部边框线左边距 |
| `--xbd-input-border-right-space` | `0` | 底部边框线右边距 |
| `--xbd-input-default-text-color` | `$text-color-primary` | 默认文本颜色 |
| `--xbd-input-default-tips-color` | `$text-color-placeholder` | 默认提示文本颜色 |
| `--xbd-input-disabled-text-color` | `$text-color-disabled` | 禁用态文本颜色 |
| `--xbd-input-error-text-color` | `$error-color` | 错误态文本颜色 |
| `--xbd-input-error-tips-color` | `$error-color` | 错误态提示文本颜色 |
| `--xbd-input-label-max-width` | `5em` | 标签最大宽度 |
| `--xbd-input-label-min-width` | `2em` | 标签最小宽度 |
| `--xbd-input-label-text-color` | `$text-color-primary` | 标签文本颜色 |
| `--xbd-input-label-text-font` | `$font-body-large` | 标签文本字体 |
| `--xbd-input-placeholder-text-color` | `$text-color-placeholder` | 占位文本颜色 |
| `--xbd-input-placeholder-text-font` | `$font-body-large` | 占位文本字体 |
| `--xbd-input-prefix-icon-color` | `$text-color-primary` | 前置图标颜色 |
| `--xbd-input-success-text-color` | `$success-color` | 成功态文本颜色 |
| `--xbd-input-success-tips-color` | `$success-color` | 成功态提示文本颜色 |
| `--xbd-input-suffix-icon-color` | `$text-color-placeholder` | 后置图标颜色 |
| `--xbd-input-suffix-text-color` | `$text-color-primary` | 后置文本颜色 |
| `--xbd-input-vertical-padding` | `32rpx` | 输入框垂直内间距 |
| `--xbd-input-warning-text-color` | `$warning-color` | 警告态文本颜色 |
| `--xbd-input-warning-tips-color` | `$warning-color` | 警告态提示文本颜色 |
