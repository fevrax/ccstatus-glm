import type { ClaudeCodeInput } from '../types/claude-input.js';

/**
 * 从 stdin 读取并解析 Claude Code 传入的 JSON
 */
export async function readStdin(): Promise<ClaudeCodeInput> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  if (!raw) {
    throw new Error('No input received from stdin');
  }

  return JSON.parse(raw) as ClaudeCodeInput;
}
