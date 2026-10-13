# Button 按钮 (xbd-button)

用于触发操作任务，支持不同主题、尺寸、形状、禁用、加载、图标和微信开放能力。

## 何时使用

- 需要用户点击后提交、确认、跳转或触发业务操作时。
- 需要在列表、表单、弹窗底部等场景中展示明确操作入口时。

## 基础用法

### 1. 注册组件 (JSON)

```json
{
  "usingComponents": {
    "xbd-button": "xbd-miniprogram/button/button"
  }
}
```

### 2. 基础使用 (WXML)

```xml
<xbd-button content="填充按钮" />
<xbd-button variant="outline" content="描边按钮" />
<xbd-button variant="text" content="文字按钮" />
```

### 3. 主题按钮

```xml
<xbd-button theme="primary" content="主要按钮" />
<xbd-button theme="danger" content="危险按钮" />
<xbd-button theme="light" content="轻量按钮" />
```

### 4. 图标与加载状态

```xml
<xbd-button theme="primary" icon="close-linear" content="带图标按钮" />
<xbd-button loading content="加载中" />
```

## API

### Attributes (属性)

| 属性名 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `activityType` | 卡片 id | Number | - |
| `appParameter` | 打开 APP 时向 APP 传递的参数 | String | `''` |
| `block` | 是否为块级元素 | Boolean | `false` |
| `content` | 按钮内容 | String | - |
| `customDataset` | 自定义 dataset，会透传到原生按钮的 `data-custom` | Any | - |
| `disabled` | 是否禁用按钮 | Boolean | - |
| `entrancePath` | 从消息小程序入口打开小程序的路径 | String | `''` |
| `ghost` | 是否为幽灵按钮 | Boolean | `false` |
| `hoverClass` | 指定按钮按下去的样式类 | String | `''` |
| `hoverStartTime` | 按住后多久出现点击态，单位毫秒 | Number | `20` |
| `hoverStayTime` | 手指松开后点击态保留时间，单位毫秒 | Number | `70` |
| `hoverStopPropagation` | 是否阻止祖先节点出现点击态 | Boolean | `false` |
| `icon` | 图标名称或图标配置 | String / Object | - |
| `lang` | 指定返回用户信息的语言 | String | - |
| `loading` | 是否显示为加载状态 | Boolean | `false` |
| `loadingProps` | 加载图标配置 | Object | - |
| `needShowEntrance` | 转发的文本消息是否带小程序入口 | Boolean | `true` |
| `openType` | 微信开放能力 | String | - |
| `phoneNumberNoQuotaToast` | 手机号额度用尽时是否展示默认提示 | Boolean | `true` |
| `sendMessageImg` | 会话内消息卡片图片 | String | `'截图'` |
| `sendMessagePath` | 会话内消息卡片点击跳转小程序路径 | String | `'当前分享路径'` |
| `sendMessageTitle` | 会话内消息卡片标题 | String | `'当前标题'` |
| `sessionFrom` | 会话来源 | String | `''` |
| `shape` | 按钮形状，可选值：`rectangle`、`square`、`round`、`circle` | String | `rectangle` |
| `showMessageCard` | 是否显示会话内消息卡片 | Boolean | `false` |
| `size` | 组件尺寸，可选值：`extra-small`、`small`、`medium`、`large` | String | `medium` |
| `id` | 按钮标签 id | String | `''` |
| `theme` | 组件风格，可选值：`default`、`primary`、`danger`、`light` | String | `default` |
| `type` | 同小程序 `formType` | String | - |
| `variant` | 按钮形式，可选值：`base`、`outline`、`dashed`、`text` | String | `base` |

### Events (事件)

| 事件名 | 说明 | 回调参数 |
| :--- | :--- | :--- |
| `tap` | 点击按钮且非禁用、非加载状态时触发 | 原始事件对象 |
| `getuserinfo` | `openType="getUserInfo"` 时触发 | `event.detail` |
| `contact` | `openType="contact"` 时触发 | `event.detail` |
| `createliveactivity` | 创建直播活动时触发 | `event.detail` |
| `getphonenumber` | `openType="getPhoneNumber"` 时触发 | `event.detail` |
| `getrealtimephonenumber` | 获取实时手机号时触发 | `event.detail` |
| `error` | 开放能力调用失败时触发 | `event.detail` |
| `opensetting` | 打开授权设置页后触发 | `event.detail` |
| `launchapp` | 打开 APP 后触发 | `event.detail` |
| `chooseavatar` | 选择头像后触发 | `event.detail` |
| `agreeprivacyauthorization` | 同意隐私授权后触发 | `event.detail` |
| `phoneoneclicklogin` | 手机号一键登录时触发 | `event.detail` |

### Slots (插槽)

| 插槽名 | 说明 |
| :--- | :--- |
| `default` | 默认内容插槽 |
| `content` | 按钮内容插槽 |
| `suffix` | 后置内容插槽 |

### External Classes (外部样式类)

| 类名 | 说明 |
| :--- | :--- |
| `class` | 默认外部样式类 |
| `xbd-class` | 按钮根节点外部样式类 |
| `xbd-class-icon` | 图标外部样式类 |
| `xbd-class-loading` | 加载图标外部样式类 |
