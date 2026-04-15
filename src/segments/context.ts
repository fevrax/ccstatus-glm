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

    // 优先使用 Claude 直接提供的总 token 数
    const inputTokens = cw.total_input_tokens ?? 0;
    const outputTokens = cw.total_output_tokens ?? 0;
    const totalTokens = inputTokens + outputTokens;

    let pct = cw.used_percentage;
    const windowSize = cw.context_window_size ?? 0;

    // 如果百分比无效，从 token 数反算
    if ((!pct || pct <= 0) && totalTokens > 0 && windowSize > 0) {
      pct = (totalTokens / windowSize) * 100;
    }

    // 仍然无效，使用缓存
    if (!pct || pct <= 0) {
      const cached = readContextCache();
      if (!cached) return null;
      pct = cached.pct;
    } else {
      writeContextCache(pct, windowSize);
    }

    const bar = formatBar(pct, ctx.config.barWidth);

    // 优先使用直接提供的 token 数，其次从百分比估算
    const usedTokens = totalTokens > 0
      ? totalTokens
      : Math.round((pct / 100) * windowSize);

    const tokenStr = usedTokens > 0 ? ` · ${formatTokenCount(usedTokens)}` : '';

    let color: string;
    if (pct > 80) {
      color = ctx.colors.contextCritical;
    } else if (pct > 50) {
      color = ctx.colors.contextWarning;
    } else {
      color = ctx.colors.context;
    }

    return {
      icon: '\u{26A1}',
      text: `${bar} ${pct.toFixed(1)}%${tokenStr}`,
      color,
    };
  },
};
