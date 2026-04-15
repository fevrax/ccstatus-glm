import type { ColorPalette } from './types.js';

/**
 * Default - ANSI 256 色方案
 */
export const defaultScheme: ColorPalette = {
  model: '\x1b[38;5;183m',
  directory: '\x1b[38;5;117m',
  git: '\x1b[38;5;150m',
  context: '\x1b[38;5;189m',
  contextWarning: '\x1b[38;5;216m',
  contextCritical: '\x1b[38;5;203m',
  cost: '\x1b[38;5;216m',
  session: '\x1b[38;5;182m',
  style: '\x1b[38;5;222m',
  glmQuota: '\x1b[38;5;80m',      // teal — 区别于 directory(117)
};
