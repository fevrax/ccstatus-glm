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
    let pct = cw.used_percentage;
    const windowSize = cw.context_window_size ?? 0;

    // 百分比无效时，使用同会话缓存
    if (!pct || pct <= 0) {
      const cached = readContextCache(sessionId);
      if (!cached) return null;
      pct = cached.pct;
    } else {
      // Claude Code 偶尔传入远超 100 的异常值，clamp 到合理范围
      pct = Math.min(pct, 100);
      writeContextCache(sessionId, pct, windowSize);
    }

    const bar = formatBar(pct, ctx.config.barWidth);

    // 从百分比 × 窗口大小计算已用 token
    const usedTokens = Math.round((pct / 100) * windowSize);
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
      icon: '\u{1F4CA}',
      text: `${bar} ${pct.toFixed(1)}%${tokenStr}`,
      color,
    };
  },
};
