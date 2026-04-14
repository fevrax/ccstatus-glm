import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { formatCost } from '../utils/format.js';

export const costSegment: Segment = {
  name: 'cost',
  label: 'Session cost',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    const cost = ctx.input.cost?.total_cost_usd;
    if (cost === undefined || cost === null || cost === 0) return null;

    const text = formatCost(cost);
    if (!text) return null;

    return {
      icon: '\u{1F4B0}',
      text,
      color: ctx.colors.cost,
    };
  },
};
