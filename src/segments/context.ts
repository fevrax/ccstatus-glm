import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { formatBar, formatTokenCount } from '../utils/format.js';
import { readContextCache, writeContextCache } from '../utils/context-cache.js';

export const contextSegment: Segment = {
  name: 'context',
  label: 'Context usage',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    const cw = ctx.input.context_window;
    if (!cw) return null;

    const sessionId = ctx.input.session_id;
    const windowSize = cw.context_window_size ?? 0;

    // 从 current_usage 计算实际上下文使用量
    // 文档: used_percentage = (input_tokens + cache_creation_input_tokens + cache_read_input_tokens) / context_window_size
    const currentUsage = cw.current_usage;
    let pct = cw.used_percentage;
    let usedTokens = 0;

    if (currentUsage) {
      // input_only 为实际占用上下文的 token 数（不含 output）
      const inputOnly =
        currentUsage.input_tokens +
        currentUsage.cache_creation_input_tokens +
        currentUsage.cache_read_input_tokens;
      usedTokens = inputOnly;

      // 当 used_percentage 不可用时，自行从 current_usage 计算
      if (!pct || pct <= 0) {
        if (windowSize > 0) {
          pct = (inputOnly / windowSize) * 100;
        }
      }
    } else {
      // current_usage 为 null（首次 API 调用前），使用累计值作为降级
      usedTokens = cw.total_input_tokens ?? 0;
    }

    // 百分比仍无效时，使用同会话缓存，或默认 0（启动时即显示）
    if (!pct || pct <= 0) {
      const cached = readContextCache(sessionId);
      if (cached) {
        pct = cached.pct;
        usedTokens = Math.round((pct / 100) * windowSize);
      } else {
        pct = 0;
      }
    } else {
      // Claude Code 偶尔传入远超 100 的异常值，clamp 到合理范围
      pct = Math.min(pct, 100);
      writeContextCache(sessionId, pct, windowSize);
    }

    const bar = formatBar(pct, ctx.config.barWidth);

    // 格式：进度条 百分比 · 已用/总窗口
    const parts: string[] = [`${bar} ${pct.toFixed(1)}%`];

    // 确保始终显示 token 数：无直接值时从百分比反算
    if (usedTokens <= 0 && windowSize > 0) {
      usedTokens = Math.round((pct / 100) * windowSize);
    }

    if (usedTokens > 0 && windowSize > 0) {
      parts.push(`${formatTokenCount(usedTokens)}/${formatTokenCount(windowSize)}`);
    }

    let color: string;
    if (pct > 80) {
      color = ctx.colors.contextCritical;
    } else if (pct > 50) {
      color = ctx.colors.contextWarning;
    } else {
      color = ctx.colors.context;
    }

    return {
      icon: '\u{1F4CA}',
      text: parts.join(' \u00B7 '), // 使用中点分隔
      color,
    };
  },
};
