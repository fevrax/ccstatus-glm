# ccstatus-glm

[中文文档](README.zh-CN.md)

A modular, configurable statusline for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with built-in GLM API quota monitoring.

Built with TypeScript. Zero global install required — works with `npx`.

## Features

- **8 modular segments** — model, directory, git branch, context usage, cost, session duration, output style, GLM quota
- **GLM Coding Plan quota** — real-time token & MCP usage from ZhipuAI API
- **5 color schemes** — default (ANSI 256-color), tokyo_night, nord, catppuccin, dracula (24-bit RGB)
- **Interactive wizard** — guided setup with `@clack/prompts`
- **Auto-configure** — automatically writes statusLine to Claude Code's `settings.json`
- **Bilingual** — supports English and Chinese (auto-detected)
- **JSON config** — clean, validated configuration with Zod schemas
- **Smart caching** — session-based caching for git data and GLM quota to minimize redundant calls

## Quick Start

```bash
npx ccstatus-glm
```

This launches the setup wizard, which guides you through segment selection, color scheme, API key setup, and automatically configures Claude Code.

## Commands

| Command | Description |
|---------|-------------|
| `npx ccstatus-glm` | Smart router: render statusline (piped stdin) or launch wizard (interactive) |
| `npx ccstatus-glm init` | Run the setup wizard |
| `npx ccstatus-glm config` | View current configuration |
| `npx ccstatus-glm config set <key> <value>` | Set a config value (supports dot notation, e.g. `glm.apiKey`) |
| `npx ccstatus-glm config get <key>` | Get a config value |
| `npx ccstatus-glm config reset` | Reset to defaults |
| `npx ccstatus-glm doctor` | Run diagnostics (checks script, settings, git, hooks) |
| `npx ccstatus-glm uninstall` | Remove config, cache, bin script, and restore settings.json |

**Global option:** `--locale <en|zh>` overrides language detection.

## Configuration

Config file: `~/.claude/ccstatus-glm.json`

```json
{
  "version": 1,
  "locale": "en",
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

### Config Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | number | `1` | Config schema version |
| `locale` | `'en'` \| `'zh'` | `'en'` | Display language |
| `segments` | string[] | (all except `output_style`) | Ordered list of segments to display |
| `colorScheme` | string | `'default'` | Color scheme name |
| `separator` | string | `' \| '` | Separator between segments |
| `barWidth` | number (4–40) | `6` | Context bar width in characters |
| `dirShorten` | number (0–10) | `2` | Directory depth to show (0 = full path) |
| `gitShowSha` | boolean | `false` | Show short SHA after branch name |
| `gitDetailed` | boolean | `false` | Show staged/modified/untracked counts |
| `gitCacheTtl` | number (1–60) | `5` | Git data cache TTL in seconds |
| `glm.apiKey` | string | `''` | ZhipuAI API key |
| `glm.cacheTtl` | number (10–3600) | `60` | GLM quota cache TTL in seconds |

### Segments

| Segment | Key | Default | Description | Example |
|---------|-----|---------|-------------|---------|
| Model | `model` | Enabled | Current model display name | `🤖 glm-5.1` |
| Directory | `directory` | Enabled | Working directory (shortened to N levels) | `📂 Code/Web` |
| Git | `git` | Enabled | Branch name, optional SHA and dirty status | `🌿 main +2 ~3 ?1` |
| Context | `context` | Enabled | Usage bar + percentage + token breakdown | `📊 ████░░░░░░ 35% · 70k/200k ↑65k ↓5k` |
| Cost | `cost` | Enabled | Session cost in USD (hidden if $0) | `💰 $0.25` |
| Session | `session` | Enabled | Session duration | `⏱️ 5m30s` |
| Output style | `output_style` | **Disabled** | Current output style name | `🎨 engineer-professional` |
| GLM quota | `glm_quota` | Enabled | Token & MCP usage with level and reset time | `🔧 LITE Token:5% MCP:31% 10:52` |

**Notes:**
- Context bar color changes at 50% (warning) and 80% (critical). Token breakdown shows input (↑) and output (↓) counts.
- Git segment supports two modes:
  - **Simple mode** (`gitDetailed: false`): Shows branch name only.
  - **Detailed mode** (`gitDetailed: true`): Shows branch name with `+N` (staged), `~N` (modified), `?N` (untracked) counts.
  - When `gitShowSha` is enabled, the short commit SHA is appended after the branch name (e.g., `main@a1b2c3d`).

### Color Schemes

| Scheme | Description |
|--------|-------------|
| `default` | ANSI 256-color palette (broad terminal compatibility) |
| `tokyo_night` | Purple-toned dark theme (24-bit RGB) |
| `nord` | Arctic blue-gray tones (24-bit RGB) |
| `catppuccin` | Soft warm tones — Catppuccin Mocha (24-bit RGB) |
| `dracula` | Classic dark theme — Dracula (24-bit RGB) |

### GLM API Setup

The GLM quota segment fetches usage data from the ZhipuAI API. To enable it:

1. Obtain an API key from [open.bigmodel.cn](https://open.bigmodel.cn/)
2. Enter it during the setup wizard, or set it manually:
   ```bash
   npx ccstatus-glm config set glm.apiKey "your-api-key-here"
   ```

Quota data is cached locally (default 60 seconds) to avoid unnecessary API calls.

## How It Works

**Dual-mode execution:**

1. **Statusline render mode** (piped stdin): When Claude Code invokes the command, it pipes a JSON object to stdin containing model info, cost, context window usage, and more. The CLI parses this JSON, renders configured segments with ANSI colors, and prints to stdout. Claude Code displays the output in the terminal status bar.

2. **Interactive mode** (TTY detected): When a user runs `npx ccstatus-glm` directly, the CLI detects that stdin is a TTY and launches the setup wizard instead.

**Installation flow:**

1. Language selection
2. Segment selection
3. Color scheme selection
4. GLM API key input
5. Cache TTL configuration
6. Optional advanced settings (separator, bar width, directory depth, git options)
7. Saves config to `~/.claude/ccstatus-glm.json`
8. Copies the self-contained bundle to `~/.claude/bin/ccstatus-glm`
9. Writes `statusLine` config into Claude Code's `~/.claude/settings.json`
10. Runs post-install verification (script existence, permissions, settings, test execution)

**Caching strategy:**

All caches use `session_id` as the key (not PID) for stability across invocations.

| Cache | Location | Default TTL |
|-------|----------|-------------|
| Git data | `/tmp/ccstatus-glm-git-{sessionId}.json` | 5s |
| GLM quota | `/tmp/ccstatus-glm-quota.txt` | 60s |
| Context percentage | `/tmp/ccstatus-glm-{sessionId}.json` | 60s |

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Development (watch mode)
pnpm dev

# Format check
pnpm lint

# Format fix
pnpm format

# Test locally
echo '{"model":{"display_name":"glm-5.1"},"cwd":"/tmp","context_window":{"total_input_tokens":65000,"total_output_tokens":5000,"context_window_size":200000,"used_percentage":35},"cost":{"total_cost_usd":0.42,"total_duration_ms":3725000},"session_id":"test","transcript_path":""}' | node dist/cli.js
```

## Requirements

- Node.js 18+
- Git (for branch detection)

## License

[MIT](LICENSE)
