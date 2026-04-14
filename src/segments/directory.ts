import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { shortenPath } from '../utils/path.js';

export const directorySegment: Segment = {
  name: 'directory',
  label: 'Directory',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    const cwd = ctx.input.cwd || ctx.cwd;
    if (!cwd) return null;

    const text = shortenPath(cwd, ctx.config.dirShorten);

    return {
      icon: '\u{1F4C2}',
      text,
      color: ctx.colors.directory,
    };
  },
};
