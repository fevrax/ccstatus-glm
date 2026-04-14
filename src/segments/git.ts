import { execSync } from 'node:child_process';
import type { Segment, SegmentContext, SegmentResult } from './types.js';

export const gitSegment: Segment = {
  name: 'git',
  label: 'Git branch',
  defaultEnabled: true,

  render(ctx: SegmentContext): SegmentResult | null {
    const cwd = ctx.input.cwd || ctx.cwd;
    let branch: string | null = null;

    try {
      branch = execSync('git symbolic-ref --short HEAD', {
        cwd,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();
    } catch {
      try {
        branch = execSync('git rev-parse --short HEAD', {
          cwd,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();
      } catch {
        return null;
      }
    }

    let text = branch;
    if (ctx.config.gitShowSha) {
      try {
        const sha = execSync('git rev-parse --short HEAD', {
          cwd,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();
        if (sha !== branch) {
          text = `${branch}@${sha}`;
        }
      } catch {
        // sha 获取失败，仅显示分支名
      }
    }

    return {
      icon: '\u{1F33F}',
      text,
      color: ctx.colors.git,
    };
  },
};
