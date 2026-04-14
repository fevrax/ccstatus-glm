import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { formatDuration } from '../utils/format.js';

export const sessionSegment: Segment = {
  name: 'session',
  label: 'Session duration',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    const ms = ctx.input.cost?.total_duration_ms;
    if (!ms || ms <= 0) return null;

    const text = formatDuration(ms);
    if (!text) return null;

    return {
      icon: '\u{23F1}\uFE0F',
      text,
      color: ctx.colors.session,
    };
  },
};
