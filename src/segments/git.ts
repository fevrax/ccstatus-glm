import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Segment, SegmentContext, SegmentResult } from './types.js';
import {
  readGitCache,
  writeGitCache,
  type GitCacheData,
} from '../utils/git-cache.js';

const execFileAsync = promisify(execFile);

/**
 * 异步执行 git 命令（2 秒超时）
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
 * 计算输出中的非空行数
 */
function countOutputLines(output: string | null): number {
  if (!output) return 0;
  return output.split('\n').filter((l) => l.trim().length > 0).length;
}

/**
 * 收集新鲜的 git 数据（缓存未命中时调用）
 */
async function collectGitData(
  cwd: string,
  sessionId: string,
  detailed: boolean,
  showSha: boolean,
  stdinBranch?: string,
): Promise<GitCacheData | null> {
  // 分支名：优先使用 stdin 提供的 worktree.branch
  let branch = stdinBranch ?? null;

  if (!branch) {
    branch = await git(['symbolic-ref', '--short', 'HEAD'], cwd);
    if (!branch) {
      // detached HEAD — 使用短 SHA 作为分支显示
      branch = await git(['rev-parse', '--short', 'HEAD'], cwd);
      if (!branch) return null; // 非 git 仓库
    }
  }

  // 可选 SHA（仅当分支名不是 SHA 本身时）
  let sha: string | null = null;
  if (showSha) {
    sha = await git(['rev-parse', '--short', 'HEAD'], cwd);
    if (sha === branch) sha = null; // detached HEAD 已在显示 SHA
  }

  // 状态计数
  let staged = 0;
  let modified = 0;
  let untracked = 0;

  if (detailed) {
    // 详细模式：分别统计暂存、修改、未跟踪
    const cachedNumstat = await git(['diff', '--cached', '--numstat'], cwd);
    staged = countOutputLines(cachedNumstat);

    const numstat = await git(['diff', '--numstat'], cwd);
    modified = countOutputLines(numstat);

    const others = await git(
      ['ls-files', '--others', '--exclude-standard'],
      cwd,
    );
    untracked = countOutputLines(others);
  } else {
    // 简单模式：布尔脏检测（保持向后兼容）
    const statusOutput = await git(['status', '--porcelain=v1'], cwd);
    if (statusOutput && statusOutput.length > 0) {
      modified = 1; // 标记为脏
    }
  }

  const data: GitCacheData = {
    sessionId,
    branch,
    sha,
    staged,
    modified,
    untracked,
  };

  // 写入缓存
  writeGitCache(data);

  return data;
}

/**
 * 从缓存数据构建渲染结果
 */
function buildResult(
  data: GitCacheData,
  ctx: SegmentContext,
): SegmentResult {
  const parts: string[] = [];

  // 分支名
  let branchDisplay = data.branch ?? '?';
  if (data.sha && data.sha !== data.branch) {
    branchDisplay = `${data.branch}@${data.sha}`;
  }
  parts.push(branchDisplay);

  const detailed = ctx.config.gitDetailed;

  if (detailed) {
    // 详细模式：+N ~N ?N 符号前缀
    const indicators: string[] = [];
    if (data.staged > 0) indicators.push(`+${data.staged}`);
    if (data.modified > 0) indicators.push(`~${data.modified}`);
    if (data.untracked > 0) indicators.push(`?${data.untracked}`);
    if (indicators.length > 0) {
      parts.push(indicators.join(' '));
    }
  }
  // 简单模式仅显示分支名，不附加脏状态指示器

  return {
    icon: '\u{1F33F}',
    text: parts.join(' '),
    color: ctx.colors.git,
  };
}

export const gitSegment: Segment = {
  name: 'git',
  label: 'Git branch',
  defaultEnabled: true,

  render(
    ctx: SegmentContext,
  ): Promise<SegmentResult | null> | SegmentResult | null {
    const cwd = ctx.input.cwd || ctx.cwd;
    const sessionId = ctx.input.session_id;
    const ttl = ctx.config.gitCacheTtl;
    const detailed = ctx.config.gitDetailed;
    const showSha = ctx.config.gitShowSha;

    // stdin 提供的分支名（worktree 会话中可用）
    const stdinBranch = ctx.input.worktree?.branch;

    return (async () => {
      // 1. 检查缓存
      const cached = readGitCache(sessionId, ttl);
      if (cached) {
        return buildResult(cached, ctx);
      }

      // 2. 收集新鲜数据
      const data = await collectGitData(
        cwd,
        sessionId,
        detailed,
        showSha,
        stdinBranch,
      );
      if (!data) return null;

      return buildResult(data, ctx);
    })();
  },
};
