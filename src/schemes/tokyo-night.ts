import type { ColorPalette } from './types.js';

/**
 * Tokyo Night - 紫色调暗色方案（24-bit RGB）
 */
export const tokyoNightScheme: ColorPalette = {
  model: '\x1b[38;2;187;154;247m',       // 紫色
  directory: '\x1b[38;2;122;162;247m',    // 蓝色
  git: '\x1b[38;2;158;206;106m',          // 绿色
  context: '\x1b[38;2;192;202;245m',      // 淡紫白
  contextWarning: '\x1b[38;2;255;158;100m',   // 橙色
  contextCritical: '\x1b[38;2;247;118;142m',  // 红粉
  cost: '\x1b[38;2;255;158;100m',         // 橙色
  session: '\x1b[38;2;187;154;247m',      // 紫色
  style: '\x1b[38;2;255;214;102m',        // 黄色
  glmQuota: '\x1b[38;2;125;207;220m',     // 柔和 teal — 区别于 directory 蓝色
};
