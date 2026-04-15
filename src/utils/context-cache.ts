import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';

const CACHE_DIR = '/tmp';

export interface ContextCache {
  sessionId: string;
  pct: number;
  windowSize: number;
}

function cacheFile(sessionId: string): string {
  return `${CACHE_DIR}/ccstatus-glm-${sessionId}.json`;
}

/**
 * 读取缓存（60 秒内有效，且 session_id 必须匹配）
 */
export function readContextCache(sessionId: string): ContextCache | null {
  const file = cacheFile(sessionId);
  if (!existsSync(file)) return null;

  try {
    const stat = statSync(file);
    const age = (Date.now() - stat.mtimeMs) / 1000;
    if (age > 60) return null;

    const raw = readFileSync(file, 'utf-8');
    const data = JSON.parse(raw) as ContextCache;
    if (typeof data.pct !== 'number' || data.pct <= 0) return null;
    if (data.sessionId !== sessionId) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * 写入缓存（关联 session_id）
 */
export function writeContextCache(sessionId: string, pct: number, windowSize: number): void {
  const file = cacheFile(sessionId);
  writeFileSync(file, JSON.stringify({ sessionId, pct, windowSize }), 'utf-8');
}
