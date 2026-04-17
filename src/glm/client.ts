import { readCache, writeCache } from './cache.js';
import { sanitizePercent, sanitizeNumber } from '../utils/sanitize.js';

const GLM_API_URL = 'https://bigmodel.cn/api/monitor/usage/quota/limit';

export interface GlmQuotaInfo {
  level: string;
  tokenPercent: number;
  tokenResetTime: string;
  timePercent: number;
  timeRemaining: number;
  timeResetTime: string;
  details: Array<{ model: string; usage: number }>;
}

/**
 * 获取 GLM 配额信息（带缓存）
 */
export async function fetchGlmQuota(
  apiKey: string,
  cacheTtl: number,
): Promise<GlmQuotaInfo | null> {
  if (!apiKey) return null;

  // 先检查缓存
  const cached = readCache(cacheTtl);
  if (cached) {
    try {
      return JSON.parse(cached) as GlmQuotaInfo;
    } catch {
      // 缓存损坏，继续请求
    }
  }

  try {
    const response = await fetch(GLM_API_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as Record<string, unknown>;
    const info = parseQuotaResponse(json);

    if (info) {
      writeCache(JSON.stringify(info));
    }

    return info;
  } catch {
    return null;
  }
}

/**
 * 解析 GLM API 实际响应结构
 *
 * 实际返回：
 * {
 *   "code": 200,
 *   "data": {
 *     "limits": [
 *       { "type": "TIME_LIMIT", "usage": 100, "currentValue": 31, "remaining": 69, "percentage": 31, "nextResetTime": ..., "usageDetails": [...] },
 *       { "type": "TOKENS_LIMIT", "percentage": 2, "nextResetTime": ... }
 *     ],
 *     "level": "lite"
 *   }
 * }
 */
function parseQuotaResponse(json: Record<string, unknown>): GlmQuotaInfo | null {
  try {
    const data = json.data as Record<string, unknown> | undefined;
    if (!data) return null;

    const limits = data.limits as Array<Record<string, unknown>> | undefined;
    if (!limits || !Array.isArray(limits)) return null;

    const level = String(data.level ?? '').replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '');

    let tokenPercent = 0;
    let timePercent = 0;
    let timeRemaining = 0;
    let tokenResetTime = '';
    let timeResetTime = '';
    const details: Array<{ model: string; usage: number }> = [];

    for (const limit of limits) {
      const type = String(limit.type ?? '');

      if (type === 'TOKENS_LIMIT') {
        tokenPercent = sanitizePercent(limit.percentage);
        const resetTs = Number(limit.nextResetTime ?? 0);
        if (resetTs > 0) {
          tokenResetTime = formatResetTime(resetTs);
        }
      }

      if (type === 'TIME_LIMIT') {
        timePercent = sanitizePercent(limit.percentage);
        timeRemaining = sanitizeNumber(limit.remaining);
        const resetTs = Number(limit.nextResetTime ?? 0);
        if (resetTs > 0) {
          timeResetTime = formatResetTime(resetTs);
        }
        // 解析 usageDetails
        const usageDetails = limit.usageDetails as
          | Array<Record<string, unknown>>
          | undefined;
        if (usageDetails && Array.isArray(usageDetails)) {
          for (const detail of usageDetails) {
            details.push({
              model: String(detail.modelCode ?? ''),
              usage: sanitizeNumber(detail.usage),
            });
          }
        }
      }
    }

    return {
      level,
      tokenPercent,
      tokenResetTime,
      timePercent,
      timeRemaining,
      timeResetTime,
      details,
    };
  } catch {
    return null;
  }
}

/**
 * 格式化重置时间戳（毫秒），今天显示 HH:MM，否则显示 YYYY-M-D HH:MM
 */
function formatResetTime(ms: number): string {
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const now = new Date();
  const isToday = d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
  if (isToday) return `${hh}:${mm}`;
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${hh}:${mm}`;
}
