# ccstatus-glm

[中文文档](README.zh-CN.md)

A modular, configurable statusline for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with built-in GLM API quota monitoring.

Built with TypeScript. Zero global install required — works with `npx`.

## Features

- **Modular segments** — model, directory, git branch, context usage, cost, session duration, output style, GLM quota
- **GLM Coding Plan quota** — real-time token & MCP usage from ZhipuAI API
- **4 color schemes** — default (ANSI 256-color), tokyo_night, nord, catppuccin (24-bit RGB)
- **Interactive wizard** — beautiful guided setup with `@clack/prompts`
- **Auto-configure** — automatically writes statusLine to Claude Code's `settings.json`
- **Bilingual** — supports English and Chinese (auto-detected)
- **JSON config** — clean, validated configuration with Zod schemas

## Quick Start

```bash
npx ccstatus-glm
```

This launches the setup wizard, which will guide you through segment selection, color scheme, API key setup, and automatically configure Claude Code.

## Commands

| Command | Description |
|---------|-------------|
| `npx ccstatus-glm` | Launch setup wizard (interactive) / render statusline (piped stdin) |
| `npx ccstatus-glm init` | Run the setup wizard |
| `npx ccstatus-glm config` | View current configuration |
| `npx ccstatus-glm config set <key> <value>` | Set a config value |
| `npx ccstatus-glm config get <key>` | Get a config value |
| `npx ccstatus-glm config reset` | Reset to defaults |
| `npx ccstatus-glm doctor` | Run diagnostics |
| `npx ccstatus-glm uninstall` | Remove ccstatus-glm |

## Configuration

Config file: `~/.claude/ccstatus-glm.json`

```json
{
  "version": 1,
  "locale": "en",
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

### Segments

| Segment | Key | Description | Example |
|---------|-----|-------------|---------|
| Model | `model` | Current model name | `🤖 glm-5.1` |
| Directory | `directory` | Working directory (shortened) | `📂 Code/Web` |
| Git | `git` | Current branch | `🌿 main` |
| Context | `context` | Context window usage bar | `📊 ████░░░░░░ 35%` |
| Cost | `cost` | Session cost (hidden if $0) | `💰 $0.25` |
| Session | `session` | Session duration | `⏱️ 5m30s` |
| Output style | `output_style` | Current output style name | `🎨 engineer-professional` |
| GLM quota | `glm_quota` | Token & MCP usage with level | `🔧 LITE Token:5% MCP:31% 10:52` |

> Context bar color changes at 50% (warning) and 80% (critical).

### Color Schemes

| Scheme | Description |
|--------|-------------|
| `default` | ANSI 256-color palette |
| `tokyo_night` | Purple-toned dark theme (24-bit RGB) |
| `nord` | Arctic blue-gray tones (24-bit RGB) |
| `catppuccin` | Soft warm tones — Catppuccin Mocha (24-bit RGB) |

### GLM API Setup

The GLM quota segment fetches usage data from the ZhipuAI API. To enable it:

1. Obtain an API key from [open.bigmodel.cn](https://open.bigmodel.cn/)
2. Enter it during the setup wizard, or set it manually:
   ```bash
   npx ccstatus-glm config set glm.apiKey "your-api-key-here"
   ```

The quota data is cached locally (default 120 seconds) to avoid unnecessary API calls.

## How It Works

When Claude Code executes the statusline command after each assistant message, it pipes a JSON object to stdin containing model info, cost, context window usage, and more. The CLI parses this JSON, renders configurable segments with ANSI colors, and prints the result to stdout. Claude Code displays the output in the terminal status bar.

When run interactively (`npx ccstatus-glm`), the CLI detects that stdin is a TTY and launches the setup wizard instead.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Development (watch mode)
pnpm dev

# Test locally
echo '{"model":{"display_name":"glm-5.1"},"cwd":"/tmp","context_window":{"used_percentage":35,"context_window_size":200000},"cost":{"total_cost_usd":0.42,"total_duration_ms":3725000},"transcript_path":""}' | node dist/cli.js
```

## Requirements

- Node.js 18+
- Git (for branch detection)

## License

[MIT](LICENSE)
