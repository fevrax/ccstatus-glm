/**
 * 格式化会话时长（毫秒 → 可读格式）
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h${pad(minutes)}m${pad(seconds)}s`;
  }
  if (minutes > 0) {
    return `${minutes}m${pad(seconds)}s`;
  }
  return `${seconds}s`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * 格式化费用
 */
export function formatCost(usd: number): string {
  if (usd === 0) return '';
  if (usd < 0.01) return '<$0.01';
  return `$${usd.toFixed(2)}`;
}

/**
 * 生成上下文使用率进度条
 */
export function formatBar(percentage: number, width: number): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
}
