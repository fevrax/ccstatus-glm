/**
 * Claude Code 通过 stdin 传递给 statusline 命令的 JSON 结构
 */
export interface ClaudeCodeInput {
  model: {
    display_name: string;
  };
  cwd: string;
  context_window: {
    used_percentage: number;
    context_window_size: number;
  };
  cost: {
    total_cost_usd: number;
    total_duration_ms: number;
  };
  transcript_path: string;
}
