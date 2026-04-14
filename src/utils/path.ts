/**
 * 缩短路径，只保留最后 N 级目录
 */
export function shortenPath(path: string, keepLast: number): string {
  if (keepLast <= 0) return path;
  const parts = path.replace(/\/$/, '').split('/');
  if (parts.length <= keepLast) return path;
  return parts.slice(-keepLast).join('/');
}
