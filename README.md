# ccstatus-glm

A modular, configurable statusline for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with built-in GLM API quota monitoring.

Built with TypeScript. Zero global install required — works with `npx`.

## Features

- **Modular segments** — model, directory, git branch, context usage, cost, session duration, output style, GLM quota
- **GLM Coding Plan quota** — real-time token usage and reset time from ZhipuAI API
- **4 color schemes** — default (ANSI 256-color), tokyo_night, nord, catppuccin (24-bit RGB)
- **Interactive wizard** — beautiful guided setup with `@clack/prompts`
- **Auto-configure** — automatically sets up Claude Code's `settings.json` statusline
- **Bilingual** — supports English and Chinese (auto-detected)
- **JSON config** — clean, validated configuration with Zod schemas

## Quick Start

```bash
npx ccstatus-glm init
```

The wizard will guide you through segment selection, color scheme, API key setup, and automatically configure Claude Code.

## Commands

| Command | Description |
|---------|-------------|
| `npx ccstatus-glm` | Render statusline from stdin (called by Claude Code) |
| `npx ccstatus-glm init` | Run the configuration wizard |
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
| Output style | `output_style` | Current output style name | `🎨 default` |
| GLM quota | `glm_quota` | Coding Plan token usage | `🔧 Token:23% MCP:15% 17:41` |

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
2. Enter it during `init` wizard, or set it manually:
   ```bash
   npx ccstatus-glm config set glm.apiKey "your-api-key-here"
   ```

The quota data is cached locally (default 120 seconds) to avoid unnecessary API calls.

## How It Works

Claude Code executes the statusline command after each assistant message and pipes a JSON object to stdin containing model info, cost, context window usage, and more. The CLI parses this JSON, renders configurable segments with ANSI colors, and prints the result to stdout. Claude Code displays the output in the terminal status bar.

The GLM quota segment additionally queries the ZhipuAI API with file-based caching to show Coding Plan token usage and reset times.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Development (watch mode)
pnpm dev

# Test
pnpm test

# Run locally
echo '{"model":{"display_name":"glm-5.1"},"cwd":"/tmp","context_window":{"used_percentage":35,"context_window_size":200000},"cost":{"total_cost_usd":0.42,"total_duration_ms":3725000},"transcript_path":""}' | node dist/cli.js
```

## Publishing

```bash
# Build and publish to npm
pnpm build
npm publish
```

## Requirements

- Node.js 18+
- Git (for branch detection)

## License

[MIT](LICENSE)
