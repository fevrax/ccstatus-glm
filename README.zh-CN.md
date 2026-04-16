# ccstatus-glm

[English](README.md)

一个模块化、可配置的 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 状态栏工具，内置 GLM API 配额监控。

使用 TypeScript 构建，无需全局安装，`npx` 即可使用。

## 功能特性

- **8 个模块化段** — 模型、目录、Git 分支、上下文使用率、费用、会话时长、输出风格、GLM 配额
- **GLM Coding Plan 配额** — 实时显示 Token 和 MCP 调用额度
- **5 种配色方案** — default（ANSI 256 色）、tokyo_night、nord、catppuccin、dracula（24-bit RGB）
- **交互式向导** — 使用 `@clack/prompts` 提供美观的配置体验
- **自动配置** — 自动写入 Claude Code 的 `settings.json` statusLine 配置
- **中英双语** — 支持中文和英文（自动检测）
- **JSON 配置** — 使用 Zod schema 验证，干净可靠
- **智能缓存** — 基于 session_id 的缓存策略，减少 Git 和 GLM API 重复调用

## 快速开始

```bash
npx ccstatus-glm
```

直接运行即可启动配置向导，引导你完成段选择、配色方案、API 密钥设置，并自动配置 Claude Code。

## 命令

| 命令 | 说明 |
|------|------|
| `npx ccstatus-glm` | 智能路由：渲染状态栏（管道输入）/ 启动配置向导（交互模式） |
| `npx ccstatus-glm init` | 运行配置向导 |
| `npx ccstatus-glm config` | 查看当前配置 |
| `npx ccstatus-glm config set <key> <value>` | 设置配置值（支持点号路径，如 `glm.apiKey`） |
| `npx ccstatus-glm config get <key>` | 获取配置值 |
| `npx ccstatus-glm config reset` | 重置为默认配置 |
| `npx ccstatus-glm doctor` | 运行诊断检查（脚本、配置、Git、钩子） |
| `npx ccstatus-glm uninstall` | 卸载 ccstatus-glm（移除配置、缓存、脚本并恢复 settings.json） |

**全局选项：** `--locale <en|zh>` 可覆盖语言检测。

## 配置

配置文件：`~/.claude/ccstatus-glm.json`

```json
{
  "version": 1,
  "locale": "zh",
  "segments": ["model", "directory", "git", "context", "cost", "session", "glm_quota"],
  "colorScheme": "default",
  "separator": " | ",
  "barWidth": 6,
  "dirShorten": 2,
  "gitShowSha": false,
  "gitDetailed": false,
  "gitCacheTtl": 5,
  "glm": {
    "apiKey": "",
    "cacheTtl": 60
  }
}
```

### 配置项参考

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `version` | number | `1` | 配置 schema 版本 |
| `locale` | `'en'` \| `'zh'` | `'en'` | 显示语言 |
| `segments` | string[] | (除 `output_style` 外全部) | 段显示顺序 |
| `colorScheme` | string | `'default'` | 配色方案名称 |
| `separator` | string | `' \| '` | 段之间的分隔符 |
| `barWidth` | number (4–40) | `6` | 上下文进度条宽度（字符数） |
| `dirShorten` | number (0–10) | `2` | 目录显示深度（0 = 完整路径） |
| `gitShowSha` | boolean | `false` | 在分支名后显示短 SHA |
| `gitDetailed` | boolean | `false` | 显示暂存/修改/未跟踪文件计数 |
| `gitCacheTtl` | number (1–60) | `5` | Git 数据缓存 TTL（秒） |
| `glm.apiKey` | string | `''` | 智谱 AI API 密钥 |
| `glm.cacheTtl` | number (10–3600) | `60` | GLM 配额缓存 TTL（秒） |

### 段说明

| 段 | 配置键 | 默认 | 说明 | 示例 |
|---|--------|------|------|------|
| 模型 | `model` | 启用 | 当前模型显示名称 | `🤖 glm-5.1` |
| 目录 | `directory` | 启用 | 工作目录（缩短至 N 层） | `📂 Code/Web` |
| Git | `git` | 启用 | 分支名、可选 SHA 和文件状态 | `🌿 main +2 ~3 ?1` |
| 上下文 | `context` | 启用 | 使用率进度条 + 百分比 + Token 明细 | `📊 ████░░░░░░ 35% · 70k/200k ↑65k ↓5k` |
| 费用 | `cost` | 启用 | 会话费用（$0 时自动隐藏） | `💰 $0.25` |
| 时长 | `session` | 启用 | 会话持续时间 | `⏱️ 5m30s` |
| 输出风格 | `output_style` | **禁用** | 当前输出风格名称 | `🎨 engineer-professional` |
| GLM 配额 | `glm_quota` | 启用 | Token 和 MCP 使用量，含等级和重置时间 | `🔧 LITE Token:5% MCP:31% 10:52` |

**补充说明：**
- 上下文进度条颜色在 50% 时变为警告色，80% 时变为危险色。Token 明细显示输入（↑）和输出（↓）数量。
- Git 段支持两种模式：
  - **简单模式**（`gitDetailed: false`）：仅显示分支名。
  - **详细模式**（`gitDetailed: true`）：显示分支名，并附加 `+N`（暂存）、`~N`（已修改）、`?N`（未跟踪）计数。
  - 启用 `gitShowSha` 时，分支名后会附加短提交 SHA（如 `main@a1b2c3d`）。

### 配色方案

| 方案 | 说明 |
|------|------|
| `default` | ANSI 256 色调色板（广泛终端兼容） |
| `tokyo_night` | 紫色调暗色主题（24-bit RGB） |
| `nord` | 北极蓝灰色调（24-bit RGB） |
| `catppuccin` | 柔和暖色调 — Catppuccin Mocha（24-bit RGB） |
| `dracula` | 经典暗色主题 — Dracula（24-bit RGB） |

### GLM API 配置

GLM 配额段从智谱 AI API 获取使用数据。启用方法：

1. 从 [open.bigmodel.cn](https://open.bigmodel.cn/) 获取 API 密钥
2. 在配置向导中输入，或手动设置：
   ```bash
   npx ccstatus-glm config set glm.apiKey "你的API密钥"
   ```

配额数据会本地缓存（默认 60 秒），避免不必要的 API 调用。

## 工作原理

**双模式执行：**

1. **状态栏渲染模式**（管道输入）：Claude Code 在每次助手消息后执行状态栏命令，通过 stdin 管道传入包含模型信息、费用、上下文使用率等数据的 JSON 对象。CLI 解析此 JSON，使用 ANSI 颜色渲染配置的段，将结果输出到 stdout，Claude Code 在终端状态栏中显示。

2. **交互模式**（TTY 检测）：用户直接运行 `npx ccstatus-glm` 时，CLI 检测到 stdin 是 TTY，自动启动配置向导。

**安装流程：**

1. 语言选择
2. 段选择
3. 配色方案选择
4. GLM API 密钥输入
5. 缓存 TTL 配置
6. 可选高级设置（分隔符、进度条宽度、目录深度、Git 选项）
7. 保存配置到 `~/.claude/ccstatus-glm.json`
8. 复制自包含构建产物到 `~/.claude/bin/ccstatus-glm`
9. 写入 `statusLine` 配置到 Claude Code 的 `~/.claude/settings.json`
10. 执行安装后验证（脚本存在性、权限、配置、测试执行）

**缓存策略：**

所有缓存以 `session_id` 作为键（而非 PID），确保跨调用稳定性。

| 缓存 | 位置 | 默认 TTL |
|------|------|----------|
| Git 数据 | `/tmp/ccstatus-glm-git-{sessionId}.json` | 5 秒 |
| GLM 配额 | `/tmp/ccstatus-glm-quota.txt` | 60 秒 |
| 上下文百分比 | `/tmp/ccstatus-glm-{sessionId}.json` | 60 秒 |

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 格式检查
pnpm lint

# 格式修复
pnpm format

# 本地测试
echo '{"model":{"display_name":"glm-5.1"},"cwd":"/tmp","context_window":{"total_input_tokens":65000,"total_output_tokens":5000,"context_window_size":200000,"used_percentage":35},"cost":{"total_cost_usd":0.42,"total_duration_ms":3725000},"session_id":"test","transcript_path":""}' | node dist/cli.js
```

## 系统要求

- Node.js 18+
- Git（用于分支检测）

## 许可证

[MIT](LICENSE)
