import type { ColorPalette, ColorSchemeName } from './types.js';
import { defaultScheme } from './default.js';
import { tokyoNightScheme } from './tokyo-night.js';
import { nordScheme } from './nord.js';
import { catppuccinScheme } from './catppuccin.js';

const schemes: Record<ColorSchemeName, ColorPalette> = {
  default: defaultScheme,
  tokyo_night: tokyoNightScheme,
  nord: nordScheme,
  catppuccin: catppuccinScheme,
};

/**
 * 获取指定名称的配色方案
 */
export function getScheme(name: ColorSchemeName): ColorPalette {
  return schemes[name] ?? schemes.default;
}

/**
 * 获取所有可用方案名称
 */
export function getAvailableSchemes(): ColorSchemeName[] {
  return Object.keys(schemes) as ColorSchemeName[];
}
