/**
 * Claude Code 通过 stdin 传递给 statusline 命令的 JSON 结构
 *
 * 完整字段定义参考：https://code.claude.com/docs/en/statusline
 * 标注可选的字段仅在特定场景下出现（worktree 会话、vim 模式、agent 模式等）
 */
export interface ClaudeCodeInput {
  session_id: string;
  session_name?: string;
  transcript_path: string;
  cwd: string;
  version: string;
  model: {
    id: string;
    display_name: string;
  };
  workspace: {
    current_dir: string;
    project_dir: string;
    added_dirs: string[];
    /** git worktree 名称，仅在 linked worktree 内出现 */
    git_worktree?: string;
  };
  output_style: {
    name: string;
  };
  cost: {
    total_cost_usd: number;
    total_duration_ms: number;
    total_api_duration_ms: number;
    total_lines_added: number;
    total_lines_removed: number;
  };
  context_window: {
    total_input_tokens: number;
    total_output_tokens: number;
    context_window_size: number;
    current_usage: {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens: number;
      cache_read_input_tokens: number;
    } | null;
    used_percentage: number | null;
    remaining_percentage: number | null;
  };
  exceeds_200k_tokens: boolean;
  /** Claude.ai 订阅者的速率限制用量（首次 API 响应后出现） */
  rate_limits?: {
    five_hour?: {
      used_percentage?: number;
      resets_at?: number;
    };
    seven_day?: {
      used_percentage?: number;
      resets_at?: number;
    };
  };
  /** vim 模式状态（仅在 vim 模式启用时出现） */
  vim?: {
    mode?: string; // "NORMAL" | "INSERT"
  };
  /** agent 名称（仅在 --agent 模式或 agent 设置配置后出现） */
  agent?: {
    name?: string;
  };
  /** worktree 会话信息（仅在 --worktree 会话中出现） */
  worktree?: {
    name?: string;
    path?: string;
    /** worktree 的 git 分支名 */
    branch?: string;
    original_cwd?: string;
    original_branch?: string;
  };
}
