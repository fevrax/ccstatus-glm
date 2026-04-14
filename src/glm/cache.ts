import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';

const CACHE_FILE = '/tmp/ccstatus-glm-quota.txt';

export interface QuotaCache {
  raw: string;
  timestamp: number;
}

/**
 * 读取缓存，过期则返回 null
 */
export function readCache(ttl: number): string | null {
  if (!existsSync(CACHE_FILE)) return null;

  try {
    const stat = statSync(CACHE_FILE);
    const age = (Date.now() - stat.mtimeMs) / 1000;
    if (age > ttl) return null;

    return readFileSync(CACHE_FILE, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * 写入缓存
 */
export function writeCache(data: string): void {
  writeFileSync(CACHE_FILE, data, 'utf-8');
}
