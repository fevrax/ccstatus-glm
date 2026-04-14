import { loadConfig } from '../config/loader.js';
import { getScheme } from '../schemes/index.js';
import { renderSegments } from '../segments/registry.js';
import { readStdin } from '../utils/stdin.js';

/**
 * 默认命令：读取 stdin JSON，渲染状态栏输出到 stdout
 * 这是 Claude Code 调用的热路径，必须尽可能快
 */
export async function runCommand(): Promise<void> {
  try {
    const input = await readStdin();
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
    // 静默失败 - 状态栏不应阻塞 Claude Code
    process.exit(0);
  }
}
