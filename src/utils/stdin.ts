import type { ClaudeCodeInput } from '../types/claude-input.js';

/**
 * 从 stdin 读取并解析 Claude Code 传入的 JSON
 * 支持超时取消
 */
export function readStdin(timeoutMs?: number): Promise<ClaudeCodeInput> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let settled = false;

    const stdin = process.stdin;

    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      cleanup();

      if (err) {
        reject(err);
        return;
      }

      const raw = Buffer.concat(chunks).toString('utf-8').trim();
      if (!raw) {
        reject(new Error('No input received from stdin'));
        return;
      }

      try {
        resolve(JSON.parse(raw) as ClaudeCodeInput);
      } catch {
        reject(new Error('Invalid JSON input'));
      }
    };

    const onData = (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    };
    const onEnd = () => done();
    const onError = (err: Error) => done(err);

    stdin.on('data', onData);
    stdin.on('end', onEnd);
    stdin.on('error', onError);

    function cleanup() {
      stdin.removeListener('data', onData);
      stdin.removeListener('end', onEnd);
      stdin.removeListener('error', onError);
      // 恢复 stdin 的暂停状态
      stdin.pause();
    }

    // 超时取消
    if (timeoutMs && timeoutMs > 0) {
      setTimeout(() => {
        if (!settled) {
          done(new Error('TIMEOUT'));
        }
      }, timeoutMs);
    }

    // 开始读取
    stdin.resume();
  });
}
