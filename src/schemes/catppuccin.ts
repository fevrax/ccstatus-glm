import type { ColorPalette } from './types.js';

/**
 * Catppuccin Mocha - 柔和暖色调方案（24-bit RGB）
 */
export const catppuccinScheme: ColorPalette = {
  model: '\x1b[38;2;203;166;247m',       // Mauve
  directory: '\x1b[38;2;137;180;250m',    // Blue
  git: '\x1b[38;2;166;227;161m',          // Green
  context: '\x1b[38;2;205;214;244m',      // Text
  contextWarning: '\x1b[38;2;249;226;175m',   // Yellow
  contextCritical: '\x1b[38;2;243;139;168m',  // Red
  cost: '\x1b[38;2;250;179;135m',         // Peach
  session: '\x1b[38;2;203;166;247m',      // Mauve
  style: '\x1b[38;2;245;224;220m',        // Rosewater
  glmQuota: '\x1b[38;2;137;220;235m',     // Teal
};
