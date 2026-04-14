import { loadConfig } from '../config/loader.js';
import { getScheme } from '../schemes/index.js';
import { renderSegments } from '../segments/registry.js';
import { readStdin } from '../utils/stdin.js';

/**
 * 默认命令（智能路由）
 *
 * - stdin 有管道输入（Claude Code 调用）→ 渲染状态栏
 * - 终端直接运行（用户执行 npx ccstatus-glm）→ 启动 init 向导
 */
export async function runCommand(): Promise<void> {
  // 有管道输入 → 状态栏渲染模式
  if (!process.stdin.isTTY) {
    try {
      const input = await readStdin(500);
      const config = loadConfig();
      const colors = getScheme(config.colorScheme);

      const output = await renderSegments({
        input,
        config,
        colors,
        cwd: input.cwd || process.cwd(),
      });

      if (output) {
        process.stdout.write(output + '\n');
      }
    } catch {
      process.exit(0);
    }
    return;
  }

  // 终端直接运行 → 启动配置向导
  const { initCommand } = await import('./init.js');
  await initCommand();
}
