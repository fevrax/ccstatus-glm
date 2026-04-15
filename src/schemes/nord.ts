import type { ColorPalette } from './types.js';

/**
 * Nord - 北极蓝灰色调方案（24-bit RGB）
 */
export const nordScheme: ColorPalette = {
  model: '\x1b[38;2;136;192;208m',       // 极光蓝
  directory: '\x1b[38;2;143;188;187m',    // 霜蓝
  git: '\x1b[38;2;163;190;140m',          // 极光绿
  context: '\x1b[38;2;216;222;233m',      // 雪白
  contextWarning: '\x1b[38;2;235;203;139m',   // 极光黄
  contextCritical: '\x1b[38;2;191;97;106m',   // 极光红
  cost: '\x1b[38;2;235;203;139m',         // 极光黄
  session: '\x1b[38;2;180;142;173m',      // 极光紫
  style: '\x1b[38;2;94;120;146m',         // 极光青
  glmQuota: '\x1b[38;2;148;226;213m',     // 极光 teal — 区别于 model 极光蓝
};
