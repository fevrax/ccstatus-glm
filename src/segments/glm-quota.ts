import type { Segment, SegmentContext, SegmentResult } from './types.js';
import { fetchGlmQuota } from '../glm/client.js';

export const glmQuotaSegment: Segment = {
  name: 'glm_quota',
  label: 'GLM quota',
  defaultEnabled: true,

  async render(ctx: SegmentContext): Promise<SegmentResult | null> {
    const apiKey = ctx.config.glm.apiKey;
    if (!apiKey) return null;

    const info = await fetchGlmQuota(apiKey, ctx.config.glm.cacheTtl);
    if (!info) return null;

    const parts: string[] = [];

    // 等级标识
    if (info.level) {
      parts.push(info.level.toUpperCase());
    }

    // Token 使用百分比
    parts.push(`Token:${info.tokenPercent}%`);

    // MCP 调用额度使用百分比
    if (info.timePercent > 0) {
      parts.push(`MCP:${info.timePercent}%`);
    }

    // 重置时间
    if (info.resetTime) {
      parts.push(info.resetTime);
    }

    return {
      icon: '𝐙',
      text: parts.join(' '),
      color: ctx.colors.glmQuota,
    };
  },
};
