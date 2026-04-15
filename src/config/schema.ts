import { z } from 'zod';

/**
 * 配色方案标识枚举
 */
const ColorSchemeEnum = z.enum(['default', 'tokyo_night', 'nord', 'catppuccin']);

/**
 * 段名称枚举
 */
const SegmentNameEnum = z.enum([
  'model',
  'directory',
  'git',
  'context',
  'cost',
  'session',
  'output_style',
  'glm_quota',
]);

/**
 * GLM 配置子 schema
 */
const GlmConfigSchema = z.object({
  apiKey: z.string().default(''),
  cacheTtl: z.number().int().min(10).max(3600).default(60),
});

/**
 * 完整配置 schema
 */
export const ConfigSchema = z.object({
  version: z.number().default(1),
  locale: z.enum(['en', 'zh']).default('en'),
  segments: z.array(SegmentNameEnum).default([
    'model',
    'directory',
    'git',
    'context',
    'cost',
    'session',
    'glm_quota',
  ]),
  colorScheme: ColorSchemeEnum.default('default'),
  separator: z.string().default(' | '),
  barWidth: z.number().int().min(4).max(40).default(6),
  dirShorten: z.number().int().min(0).max(10).default(2),
  gitShowSha: z.boolean().default(false),
  glm: GlmConfigSchema.default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Config = ConfigSchema.parse({});

/**
 * 所有可用的段名称列表（含默认启用状态）
 */
export const SEGMENT_DEFAULTS: Array<{
  name: string;
  labelKey: string;
  defaultEnabled: boolean;
}> = [
  { name: 'model', labelKey: 'seg.model', defaultEnabled: true },
  { name: 'directory', labelKey: 'seg.directory', defaultEnabled: true },
  { name: 'git', labelKey: 'seg.git', defaultEnabled: true },
  { name: 'context', labelKey: 'seg.context', defaultEnabled: true },
  { name: 'cost', labelKey: 'seg.cost', defaultEnabled: true },
  { name: 'session', labelKey: 'seg.session', defaultEnabled: true },
  { name: 'output_style', labelKey: 'seg.output_style', defaultEnabled: false },
  { name: 'glm_quota', labelKey: 'seg.glm_quota', defaultEnabled: true },
];

/**
 * 所有可用的配色方案
 */
export const COLOR_SCHEME_OPTIONS: Array<{
  value: string;
  labelKey: string;
}> = [
  { value: 'default', labelKey: 'scheme.default' },
  { value: 'tokyo_night', labelKey: 'scheme.tokyo_night' },
  { value: 'nord', labelKey: 'scheme.nord' },
  { value: 'catppuccin', labelKey: 'scheme.catppuccin' },
];
