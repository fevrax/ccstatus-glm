import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Segment, SegmentContext, SegmentResult } from './types.js';

const execFileAsync = promisify(execFile);

/**
 * 异步执行 git 命令
 */
async function git(
  args: string[],
  cwd: string,
): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd,
      encoding: 'utf-8',
      timeout: 2000,
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * 检查工作区是否有未提交更改
 */
async function isDirty(cwd: string): Promise<boolean> {
  // --porcelain=v1 只输出有变更的文件路径，无变更时输出为空
  const result = await git(['status', '--porcelain=v1'], cwd);
  return result !== null && result.length > 0;
}

export const gitSegment: Segment = {
  name: 'git',
  label: 'Git branch',
  defaultEnabled: true,

  render(ctx: SegmentContext): Promise<SegmentResult | null> | SegmentResult | null {
    const cwd = ctx.input.cwd || ctx.cwd;

    // 异步执行所有 git 操作
    return (async () => {
      // 获取分支名
      let branch = await git(['symbolic-ref', '--short', 'HEAD'], cwd);
      if (!branch) {
        branch = await git(['rev-parse', '--short', 'HEAD'], cwd);
        if (!branch) return null;
      }

      // 构建显示文本
      const parts: string[] = [branch];

      // 可选显示 SHA
      if (ctx.config.gitShowSha) {
        const sha = await git(['rev-parse', '--short', 'HEAD'], cwd);
        if (sha && sha !== branch) {
          parts[0] = `${branch}@${sha}`;
        }
      }

      // 脏状态指示器
      const dirty = await isDirty(cwd);
      if (dirty) {
        parts.push('\u00B1'); // ± 表示有未提交更改
      }

      return {
        icon: '\u{1F33F}',
        text: parts.join(' '),
        color: ctx.colors.git,
      };
    })();
  },
};
