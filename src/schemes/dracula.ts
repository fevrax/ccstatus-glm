import type { ColorPalette } from './types.js';

/**
 * Dracula - 经典暗色调方案（24-bit RGB）
 * 色值来源：https://draculatheme.com/contribute
 */
export const draculaScheme: ColorPalette = {
  model: '\x1b[38;2;189;147;249m',           // Purple
  directory: '\x1b[38;2;139;233;253m',        // Cyan
  git: '\x1b[38;2;80;250;123m',              // Green
  context: '\x1b[38;2;248;248;242m',          // Foreground
  contextWarning: '\x1b[38;2;241;250;140m',   // Yellow
  contextCritical: '\x1b[38;2;255;85;85m',    // Red
  cost: '\x1b[38;2;255;184;108m',            // Orange
  session: '\x1b[38;2;189;147;249m',          // Purple
  style: '\x1b[38;2;255;121;198m',            // Pink
  glmQuota: '\x1b[38;2;139;233;253m',         // Cyan
};
