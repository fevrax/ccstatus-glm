import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { formatBar, formatTokenCount } from '../utils/format.js';
import { readContextCache, writeContextCache } from '../utils/context-cache.js';

export const contextSegment: Segment = {
  name: 'context',
  label: 'Context usage',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    let pct = ctx.input.context_window?.used_percentage;
    const windowSize = ctx.input.context_window?.context_window_size ?? 0;

    // 当前值为 0 或无效时，使用缓存的上次有效值
    if (!pct || pct <= 0) {
      const cached = readContextCache();
      if (!cached) return null;
      pct = cached.pct;
    } else {
      // 有效值，更新缓存
      writeContextCache(pct, windowSize);
    }

    const bar = formatBar(pct, ctx.config.barWidth);

    // 计算已用 token 数
    const usedTokens = Math.round((pct / 100) * (windowSize || readContextCache()?.windowSize || 0));
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
