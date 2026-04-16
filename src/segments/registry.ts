import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { sanitizeText } from '../utils/sanitize.js';
import { modelSegment } from './model.js';
import { directorySegment } from './directory.js';
import { gitSegment } from './git.js';
import { contextSegment } from './context.js';
import { costSegment } from './cost.js';
import { sessionSegment } from './session.js';
import { outputStyleSegment } from './output-style.js';
import { glmQuotaSegment } from './glm-quota.js';

/**
 * 所有段（按默认显示顺序）
 */
const ALL_SEGMENTS: Segment[] = [
  modelSegment,
  directorySegment,
  gitSegment,
  contextSegment,
  costSegment,
  sessionSegment,
  outputStyleSegment,
  glmQuotaSegment,
];

/**
 * 段名称 → 段实例映射
 */
const SEGMENT_MAP = new Map<string, Segment>(
  ALL_SEGMENTS.map((seg) => [seg.name, seg]),
);

/**
 * 获取所有段列表
 */
export function getAllSegments(): Segment[] {
  return [...ALL_SEGMENTS];
}

/**
 * 按名称查找段
 */
export function getSegmentByName(name: string): Segment | undefined {
  return SEGMENT_MAP.get(name);
}

/**
 * 渲染所有启用的段，返回拼接后的状态栏字符串
 */
export async function renderSegments(
  ctx: SegmentContext,
): Promise<string> {
  const parts: string[] = [];

  for (const name of ctx.config.segments) {
    const segment = SEGMENT_MAP.get(name);
    if (!segment) continue;

    const result = segment.render(ctx);
    if (result === null) continue;

    // 处理异步段（如 glm_quota）
    const resolved = result instanceof Promise ? await result : result;
    if (resolved === null) continue;

    parts.push(
      `${resolved.color}${resolved.icon}\x1b[0m ${resolved.color}\x1b[1m${sanitizeText(resolved.text)}\x1b[0m`,
    );
  }

  return parts.join(ctx.config.separator);
}
