import type { ClaudeCodeInput } from '../types/claude-input.js';
import type { Config } from '../config/schema.js';
import type { ColorPalette } from '../schemes/types.js';

/**
 * 传递给每个段渲染器的上下文
 */
export interface SegmentContext {
  input: ClaudeCodeInput;
  config: Config;
  colors: ColorPalette;
  cwd: string;
}

/**
 * 段渲染结果
 */
export interface SegmentResult {
  icon: string;
  text: string;
  color: string;
}

/**
 * 段接口 - 所有状态栏段必须实现此接口
 */
export interface Segment {
  readonly name: string;
  readonly label: string;
  readonly defaultEnabled: boolean;
  render(ctx: SegmentContext): SegmentResult | null;
}

/**
 * 所有段的唯一标识名
 */
export type SegmentName =
  | 'model'
  | 'directory'
  | 'git'
  | 'context'
  | 'cost'
  | 'session'
  | 'output_style'
  | 'glm_quota';
