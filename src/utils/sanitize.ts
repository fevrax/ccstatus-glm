/**
 * 文本清理工具 — 确保状态栏输出安全、无错位
 */

/**
 * 清理字符串用于安全终端显示
 *
 * 移除：
 * - ANSI 转义序列
 * - C0 控制字符（U+0000-U+001F），tab/newline/CR 替换为空格
 * - DEL（U+007F）和 C1 控制字符（U+0080-U+009F）
 * - 零宽字符（U+200B-U+200D, U+FEFF）
 *
 * 合并连续空格并 trim。
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return (
    input
      // 移除 ANSI 转义序列
      .replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')
      // tab/newline/CR 替换为空格
      .replace(/[\t\n\r]/g, ' ')
      // 移除其余控制字符和零宽字符
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '')
      // 合并连续空格
      .replace(/ {2,}/g, ' ')
      .trim()
  );
}

/**
 * 校验百分比值，返回 [0, 100] 范围内的有效数字
 * NaN / Infinity / 负数均返回 0
 */
export function sanitizePercent(value: unknown): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/**
 * 校验通用数值
 * NaN / Infinity 返回 0
 */
export function sanitizeNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}
