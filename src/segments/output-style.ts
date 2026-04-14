import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Segment, SegmentContext, SegmentResult } from './types.js';

export const outputStyleSegment: Segment = {
  name: 'output_style',
  label: 'Output style',
  defaultEnabled: false,

  render(ctx: SegmentContext): SegmentResult | null {
    const settingsPath = join(homedir(), '.claude', 'settings.json');
    if (!existsSync(settingsPath)) return null;

    try {
      const raw = readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(raw);
      const style = settings.outputStyle;
      if (!style) return null;

      return {
        icon: '\u{1F3A8}',
        text: style,
        color: ctx.colors.style,
      };
    } catch {
      return null;
    }
  },
};
