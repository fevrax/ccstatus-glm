import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';

const CACHE_FILE = '/tmp/ccstatus-glm-context.json';

export interface ContextCache {
  pct: number;
  windowSize: number;
}

/**
 * 读取缓存（60 秒内有效）
 */
export function readContextCache(): ContextCache | null {
  if (!existsSync(CACHE_FILE)) return null;

  try {
    const stat = statSync(CACHE_FILE);
    const age = (Date.now() - stat.mtimeMs) / 1000;
    if (age > 60) return null;

    const raw = readFileSync(CACHE_FILE, 'utf-8');
    const data = JSON.parse(raw) as ContextCache;
    if (typeof data.pct !== 'number' || data.pct <= 0) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * 写入缓存
 */
export function writeContextCache(pct: number, windowSize: number): void {
  writeFileSync(CACHE_FILE, JSON.stringify({ pct, windowSize }), 'utf-8');
}
