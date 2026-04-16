import { readSettings } from '../claude-settings/reader.js';
import type { Segment, SegmentContext, SegmentResult } from './types.js';

export const outputStyleSegment: Segment = {
  name: 'output_style',
  label: 'Output style',
  defaultEnabled: false,

  render(ctx: SegmentContext): SegmentResult | null {
    const settings = readSettings();
    const style = settings.outputStyle;
    if (!style || typeof style !== 'string') return null;

    return {
      icon: '\u{1F3A8}',
      text: style,
      color: ctx.colors.style,
    };
  },
};
