import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';

const CACHE_DIR = '/tmp';

/**
 * git 命令结果的缓存数据
 */
export interface GitCacheData {
  sessionId: string;
  branch: string | null;
  sha: string | null;
  staged: number;
  modified: number;
  untracked: number;
}

function cacheFilePath(sessionId: string): string {
  return `${CACHE_DIR}/ccstatus-glm-git-${sessionId}.json`;
}

/**
 * 读取缓存（TTL 内有效，且 session_id 必须匹配）
 *
 * 官方文档推荐使用 session_id 而非 PID 作为缓存 key：
 * "Process-based identifiers like $$, os.getpid(), or process.pid change on
 *  every invocation and defeat the cache."
 */
export function readGitCache(
  sessionId: string,
  ttlSeconds: number,
): GitCacheData | null {
  const file = cacheFilePath(sessionId);
  if (!existsSync(file)) return null;

  try {
    const stat = statSync(file);
    const age = (Date.now() - stat.mtimeMs) / 1000;
    if (age > ttlSeconds) return null;

    const raw = readFileSync(file, 'utf-8');
    const data = JSON.parse(raw) as GitCacheData;
    if (data.sessionId !== sessionId) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * 写入缓存（关联 session_id）
 */
export function writeGitCache(data: GitCacheData): void {
  const file = cacheFilePath(data.sessionId);
  writeFileSync(file, JSON.stringify(data), 'utf-8');
}
