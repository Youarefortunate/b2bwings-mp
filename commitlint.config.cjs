module.exports = {
  extends: ["@commitlint/config-conventional"], // 基于 Conventional Commits 规范
  rules: {
    // 允许的提交类型（通用 + AI 配置专项）
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复 Bug
        "docs", // 文档修改
        "style", // 格式、样式修改（不影响逻辑）
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试新增或修改
        "build", // 构建系统或外部依赖变动
        "ci", // 持续集成配置变更
        "chore", // 辅助工具或工程杂项变更
        "revert", // 回滚提交
        "mcp", // 单个 MCP 服务变动
        "mcps", // 多个 MCP 服务批量变动
        "skill", // 单个 AI 技能变动
        "skills", // 多个 AI 技能批量变动
        "aihook", // 单个 AI 工具链 Hook 变动
        "aihooks", // 多个 AI 工具链 Hook 批量变动
        "command", // 单个 AI 命令变动
        "commands", // 多个 AI 命令批量变动
        "agent", // 单个智能体 Agent 变动
        "agents", // 多个智能体 Agent 批量变动
      ],
    ],
    "type-case": [2, "always", "lowercase"], // 提交类型必须小写
    "type-empty": [2, "never"], // 提交类型不能为空
    "subject-empty": [2, "never"], // 提交信息的主题不能为空
    "subject-full-stop": [2, "never", "."], // 提交信息的主题禁止句号结尾
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case"], // 兼容中文并倡导英文小写首字母
    ],
    "header-max-length": [2, "always", 100], // Header 最大长度限制为 100 字符
  },
  ignores: [
    // beachball 等自动发布工具生成的提交信息
    (message) =>
      message.startsWith("Change files") ||
      message.startsWith("Packages-Publish"),
  ],
};
