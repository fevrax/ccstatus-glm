import type { Segment, SegmentContext, SegmentResult } from './types.js';

export const modelSegment: Segment = {
  name: 'model',
  label: 'Model name',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    const name = ctx.input.model?.display_name;
    if (!name) return null;

    return {
      icon: '\u{1F916}',
      text: name,
      color: ctx.colors.model,
    };
  },
};
