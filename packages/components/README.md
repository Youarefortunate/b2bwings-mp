# 组件索引

[首页](../../README.md) · [架构与构建](../../docs/ARCHITECTURE.md)

`packages/components`（包名 `xbd-components`）存放组件源码与 `_example/` 示例；
应用使用的是 `packages/miniprogram` 对应的 `xbd-miniprogram` 分发包，而不是直接引用源码目录。

## 组件文档

以下为已有独立 README 的 9 个组件（部分未完全迁移实际项目里面的所有组件）；源码中的 `tab-item` 随 Tabs 文档说明，公共样式与基础能力位于 `common/`。

| 类别 | 组件                                | 用途                             |
| ---- | ----------------------------------- | -------------------------------- |
| 基础 | [Button 按钮](button/README.md)     | 操作入口、加载状态与微信开放能力 |
| 基础 | [Icon 图标](icon/README.md)         | 字体图标与图片图标               |
| 表单 | [Input 输入框](input/README.md)     | 单行文本输入                     |
| 展示 | [Badge 徽标](badge/README.md)       | 红点、数量与状态提示             |
| 展示 | [Empty 空状态](empty/README.md)     | 空内容占位与操作引导             |
| 布局 | [Sticky 吸顶容器](sticky/README.md) | 常驻信息与操作区                 |
| 导航 | [Tabs 选项卡](tabs/README.md)       | 同层级分类切换，包含 tab-item    |
| 反馈 | [Popup 弹出层](popup/README.md)     | 浮层内容与遮罩                   |
| 反馈 | [Modal 模态框](modal/README.md)     | 确认操作与重要提示               |

各详情包含组件注册路径、示例和具体接口；不直接将 `packages/components` 的物理路径写入应用。

## 构建与预览

在仓库根目录执行：

```bash
pnpm onboard     # 准备依赖、环境与缺失的公共产物
pnpm build:ce    # 生成根目录 _example/ 预览工程
```

随后在微信开发者工具中导入 `_example/`，选择自己的 AppID 或工具提供的测试方式。
仓库不预置真实 AppID，未配置时不保证可直接启动模拟器。

修改组件后使用 `pnpm build:c` 只构建分发产物；需要同步更新预览时使用 `pnpm dev:c`，它会先构建组件与预览，再持续监听。
`build:ce` 只生成预览并同步已有组件产物，不会重新编译组件源码。
详细产物流向和自建应用接入见[架构与构建](../../docs/ARCHITECTURE.md)。
