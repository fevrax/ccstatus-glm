import { loadConfig } from '../config/loader.js';
import { getScheme } from '../schemes/index.js';
import { renderSegments } from '../segments/registry.js';
import { readStdin } from '../utils/stdin.js';

const HELP_TEXT =
  'ccstatus-glm - A modular statusline for Claude Code\n\n' +
  'Usage:\n' +
  '  ccstatus-glm init         Run the setup wizard\n' +
  '  ccstatus-glm config       View configuration\n' +
  '  ccstatus-glm doctor       Run diagnostics\n' +
  '  ccstatus-glm uninstall    Remove ccstatus-glm\n' +
  '  ccstatus-glm --help       Show all options\n';

/**
 * 默认命令：读取 stdin JSON，渲染状态栏输出到 stdout
 *
 * - 有 stdin 输入（Claude Code 调用）→ 渲染状态栏
 * - 无 stdin 输入 / 超时 → 显示帮助信息
 */
export async function runCommand(): Promise<void> {
  // 终端直接运行（非管道）→ 显示引导信息
  if (process.stdin.isTTY) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  // 管道模式：等待 stdin，超时 500ms 无数据则显示帮助
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
    // stdin 为空、超时或解析失败 → 不显示任何内容
    process.exit(0);
  }
}
