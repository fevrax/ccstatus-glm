/**
 * 配色方案 - 每个颜色值都是 ANSI 转义码字符串
 */
export interface ColorPalette {
  model: string;
  directory: string;
  git: string;
  context: string;
  contextWarning: string;
  contextCritical: string;
  cost: string;
  session: string;
  style: string;
  glmQuota: string;
}

/**
 * 配色方案标识
 */
export type ColorSchemeName = 'default' | 'tokyo_night' | 'nord' | 'catppuccin';
