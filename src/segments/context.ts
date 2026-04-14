import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { formatBar } from '../utils/format.js';

export const contextSegment: Segment = {
  name: 'context',
  label: 'Context usage',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    const pct = ctx.input.context_window?.used_percentage;
    if (pct === undefined || pct === null) return null;

    const bar = formatBar(pct, ctx.config.barWidth);
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
      text: `${bar} ${pct}%`,
      color,
    };
  },
};
