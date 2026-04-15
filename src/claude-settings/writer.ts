import {
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
  unlinkSync,
  copyFileSync,
  chmodSync,
  rmSync,
  readdirSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { SETTINGS_PATH, SETTINGS_DIR, readSettings, isStatusLineConfigured } from './reader.js';
import { backupSettings } from './backup.js';

const BIN_DIR = join(homedir(), '.claude', 'bin');
const SCRIPT_NAME = 'ccstatus-glm-statusline';
const BIN_SCRIPT_PATH = join(BIN_DIR, SCRIPT_NAME);

/** settings.json 中使用的命令路径（~ 相对路径，跨机器通用） */
const BIN_SCRIPT_COMMAND = `~/.claude/bin/${SCRIPT_NAME}`;

/** statusLine 刷新间隔（秒） */
const REFRESH_INTERVAL = 5;

/**
 * 获取当前运行的 bundle 文件绝对路径
 *
 * tsup 打包后 import.meta.url 指向 dist/cli.js 的实际位置，
 * 无论通过 npx、全局安装还是本地 node 执行都能正确解析。
 */
function getBundlePath(): string {
  return fileURLToPath(import.meta.url);
}

/**
 * 安装本地可执行脚本到 ~/.claude/bin/
 *
 * 将当前运行的 bundle 复制到 ~/.claude/bin/ccstatus-glm-statusline，
 * 并设置可执行权限。每次 init 调用会覆盖旧版本。
 *
 * @returns 安装后的脚本绝对路径
 */
export function installBinScript(): string {
  const sourcePath = getBundlePath();

  // 确保 ~/.claude/bin/ 目录存在
  if (!existsSync(BIN_DIR)) {
    mkdirSync(BIN_DIR, { recursive: true });
  }

  // 复制 bundle 到目标路径
  copyFileSync(sourcePath, BIN_SCRIPT_PATH);

  // 设置可执行权限
  chmodSync(BIN_SCRIPT_PATH, 0o755);

  return BIN_SCRIPT_COMMAND;
}

/**
 * 清理本地安装的脚本
 *
 * 删除 ~/.claude/bin/ccstatus-glm-statusline，
 * 如果目录为空则一并删除目录。
 */
export function cleanupBinScript(): void {
  if (existsSync(BIN_SCRIPT_PATH)) {
    try {
      unlinkSync(BIN_SCRIPT_PATH);
    } catch {
      // 忽略删除失败
    }
  }

  // 目录为空时清理
  try {
    if (existsSync(BIN_DIR)) {
      const files = readdirSync(BIN_DIR);
      if (files.length === 0) {
        rmSync(BIN_DIR, { recursive: true });
      }
    }
  } catch {
    // 忽略
  }
}

/**
 * 检测 statusLine 命令
 *
 * 统一通过 installBinScript() 安装本地脚本，返回绝对路径。
 * 不再使用 npx，避免每次 ~2 秒的包解析开销。
 */
export function detectCommand(): string {
  return installBinScript();
}

/**
 * 写入 statusLine 配置到 Claude Code settings.json
 * - 只修改 statusLine 字段，不影响其他配置
 * - 使用原子写入（先写临时文件再重命名）防止损坏
 * - 幂等：已存在相同配置则跳过
 */
export function writeStatusLine(
  command?: string,
): { success: boolean; alreadyConfigured: boolean } {
  const cmd = command || detectCommand();
  const settings = readSettings();

  // 幂等检查：已经配置了相同的命令则跳过
  if (isStatusLineConfigured(settings)) {
    const statusLine = settings.statusLine as Record<string, unknown>;
    if (statusLine.command === cmd && statusLine.refreshInterval === REFRESH_INTERVAL) {
      return { success: true, alreadyConfigured: true };
    }
    // 命令或 refreshInterval 不同，需要更新
  }

  // 备份原始 settings.json（仅在首次配置时备份）
  if (!existsSync(`${SETTINGS_PATH}.ccstatus-glm.bak`) && existsSync(SETTINGS_PATH)) {
    backupSettings();
  }

  // 只修改 statusLine 字段，保留其他所有字段
  settings.statusLine = {
    type: 'command',
    command: cmd,
    refreshInterval: REFRESH_INTERVAL,
  };

  // 原子写入
  const tmpPath = join(SETTINGS_DIR, '.settings.json.tmp');

  try {
    if (!existsSync(SETTINGS_DIR)) {
      mkdirSync(SETTINGS_DIR, { recursive: true });
    }

    writeFileSync(tmpPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
    renameSync(tmpPath, SETTINGS_PATH);

    return { success: true, alreadyConfigured: false };
  } catch {
    // 清理临时文件
    try {
      if (existsSync(tmpPath)) {
        unlinkSync(tmpPath);
      }
    } catch {
      // 忽略清理失败
    }
    return { success: false, alreadyConfigured: false };
  }
}

/**
 * 从 settings.json 中移除 statusLine 配置
 * 只删除 statusLine 字段，不影响其他配置
 */
export function removeStatusLine(): boolean {
  const settings = readSettings();
  if (!settings.statusLine) return true;

  delete settings.statusLine;

  const tmpPath = join(SETTINGS_DIR, '.settings.json.tmp');
  try {
    writeFileSync(tmpPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
    renameSync(tmpPath, SETTINGS_PATH);
    return true;
  } catch {
    return false;
  }
}
