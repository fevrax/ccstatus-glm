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

    // Token 使用百分比 + 重置时间
    const tokenPart = info.tokenResetTime
      ? `Token:${info.tokenPercent}% ${info.tokenResetTime}`
      : `Token:${info.tokenPercent}%`;
    parts.push(tokenPart);

    // MCP 调用额度使用百分比 + 重置时间
    if (info.timePercent > 0) {
      const mcpPart = info.timeResetTime
        ? `MCP:${info.timePercent}% ${info.timeResetTime}`
        : `MCP:${info.timePercent}%`;
      parts.push(mcpPart);
    }

    return {
      icon: '\u{1F4C8}',
      text: parts.join(' '),
      color: ctx.colors.glmQuota,
    };
  },
};
