# ccstatus-glm

[English](README.md)

一个模块化、可配置的 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 状态栏工具，内置 GLM API 配额监控。

使用 TypeScript 构建，无需全局安装，`npx` 即可使用。

## 功能特性

- **模块化段** — 模型、目录、Git 分支、上下文使用率、费用、会话时长、输出风格、GLM 配额
- **GLM Coding Plan 配额** — 实时显示 Token 和 MCP 调用额度
- **4 种配色方案** — default（ANSI 256 色）、tokyo_night、nord、catppuccin（24-bit RGB）
- **交互式向导** — 使用 `@clack/prompts` 提供美观的配置体验
- **自动配置** — 自动写入 Claude Code 的 `settings.json` statusLine 配置
- **中英双语** — 支持中文和英文（自动检测）
- **JSON 配置** — 使用 Zod schema 验证，干净可靠

## 快速开始

```bash
npx ccstatus-glm
```

直接运行即可启动配置向导，引导你完成段选择、配色方案、API 密钥设置，并自动配置 Claude Code。

## 命令

| 命令 | 说明 |
|------|------|
| `npx ccstatus-glm` | 启动配置向导（交互模式）/ 渲染状态栏（管道输入） |
| `npx ccstatus-glm init` | 运行配置向导 |
| `npx ccstatus-glm config` | 查看当前配置 |
| `npx ccstatus-glm config set <key> <value>` | 设置配置值 |
| `npx ccstatus-glm config get <key>` | 获取配置值 |
| `npx ccstatus-glm config reset` | 重置为默认配置 |
| `npx ccstatus-glm doctor` | 运行诊断检查 |
| `npx ccstatus-glm uninstall` | 卸载 ccstatus-glm |

## 配置

配置文件：`~/.claude/ccstatus-glm.json`

```json
{
  "version": 1,
  "locale": "zh",
  "segments": ["model", "directory", "git", "context", "cost", "session", "glm_quota"],
  "colorScheme": "default",
  "separator": " | ",
  "barWidth": 10,
  "dirShorten": 2,
  "gitShowSha": false,
  "glm": {
    "apiKey": "",
    "cacheTtl": 120
  }
}
```

### 段说明

| 段 | 配置键 | 说明 | 示例 |
|---|--------|------|------|
| 模型 | `model` | 当前模型名称 | `🤖 glm-5.1` |
| 目录 | `directory` | 工作目录（缩短显示） | `📂 Code/Web` |
| Git | `git` | 当前分支 | `🌿 main` |
| 上下文 | `context` | 上下文窗口使用率进度条 | `📊 ████░░░░░░ 35%` |
| 费用 | `cost` | 会话费用（$0 时自动隐藏） | `💰 $0.25` |
| 时长 | `session` | 会话持续时间 | `⏱️ 5m30s` |
| 输出风格 | `output_style` | 当前输出风格名称 | `🎨 engineer-professional` |
| GLM 配额 | `glm_quota` | Token 和 MCP 使用量 | `🔧 LITE Token:5% MCP:31% 10:52` |

> 上下文进度条颜色在 50% 时变为警告色，80% 时变为危险色。

### 配色方案

| 方案 | 说明 |
|------|------|
| `default` | ANSI 256 色调色板 |
| `tokyo_night` | 紫色调暗色主题（24-bit RGB） |
| `nord` | 北极蓝灰色调（24-bit RGB） |
| `catppuccin` | 柔和暖色调 — Catppuccin Mocha（24-bit RGB） |

### GLM API 配置

GLM 配额段从智谱 AI API 获取使用数据。启用方法：

1. 从 [open.bigmodel.cn](https://open.bigmodel.cn/) 获取 API 密钥
2. 在配置向导中输入，或手动设置：
   ```bash
   npx ccstatus-glm config set glm.apiKey "你的API密钥"
   ```

配额数据会本地缓存（默认 120 秒），避免不必要的 API 调用。

## 工作原理

Claude Code 在每次助手消息后执行状态栏命令，通过 stdin 管道传入包含模型信息、费用、上下文使用率等数据的 JSON 对象。CLI 解析此 JSON，使用 ANSI 颜色渲染可配置的段，将结果输出到 stdout，Claude Code 在终端状态栏中显示。

当交互式运行时（`npx ccstatus-glm`），CLI 检测到 stdin 是 TTY，自动启动配置向导。

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 本地测试
echo '{"model":{"display_name":"glm-5.1"},"cwd":"/tmp","context_window":{"used_percentage":35,"context_window_size":200000},"cost":{"total_cost_usd":0.42,"total_duration_ms":3725000},"transcript_path":""}' | node dist/cli.js
```

## 系统要求

- Node.js 18+
- Git（用于分支检测）

## 许可证

[MIT](LICENSE)
