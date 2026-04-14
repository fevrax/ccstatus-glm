import {
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
  unlinkSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { SETTINGS_PATH, SETTINGS_DIR, readSettings, isStatusLineConfigured } from './reader.js';
import { backupSettings } from './backup.js';

/**
 * 检测当前运行方式，生成 statusLine 命令
 *
 * 三种场景：
 * 1. npx 执行 → "npx ccstatus-glm@latest"
 * 2. pnpm link --global / pnpm add -g → "ccstatus-glm"
 * 3. 本地 node 执行 → "node /absolute/path/to/dist/cli.js"
 */
export function detectCommand(): string {
  const execPath = process.argv[1] || '';

  // npx 缓存目录特征：.npm/_npx/ 或 node_modules/.bin/
  if (
    execPath.includes('_npx') ||
    execPath.includes('.npm') ||
    (execPath.includes('node_modules') && execPath.includes('.bin'))
  ) {
    return 'npx ccstatus-glm@latest';
  }

  // 全局安装特征：bin 目录下直接有 ccstatus-glm
  if (
    execPath.endsWith('/bin/ccstatus-glm') ||
    execPath.endsWith('\\bin\\ccstatus-glm') ||
    execPath.endsWith('/ccstatus-glm') && !execPath.includes('dist')
  ) {
    return 'ccstatus-glm';
  }

  // 本地开发：node /path/to/dist/cli.js
  return `node ${resolve(execPath)}`;
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
    const statusLine = settings.statusLine as Record<string, string>;
    if (statusLine.command === cmd) {
      return { success: true, alreadyConfigured: true };
    }
    // 命令不同（比如从本地切到 npx），需要更新
  }

  // 备份原始 settings.json（仅在首次配置时备份）
  if (!existsSync(`${SETTINGS_PATH}.ccstatus-glm.bak`) && existsSync(SETTINGS_PATH)) {
    backupSettings();
  }

  // 只修改 statusLine 字段，保留其他所有字段
  settings.statusLine = {
    type: 'command',
    command: cmd,
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
