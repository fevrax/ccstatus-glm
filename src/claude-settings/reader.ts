import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const SETTINGS_DIR = join(homedir(), '.claude');
export const SETTINGS_PATH = join(SETTINGS_DIR, 'settings.json');

export interface ClaudeSettings {
  [key: string]: unknown;
}

/**
 * 安全读取 Claude Code settings.json
 */
export function readSettings(): ClaudeSettings {
  if (!existsSync(SETTINGS_PATH)) {
    return {};
  }

  try {
    const raw = readFileSync(SETTINGS_PATH, 'utf-8');
    return JSON.parse(raw) as ClaudeSettings;
  } catch {
    return {};
  }
}

/**
 * 检查 statusLine 是否已配置
 */
export function isStatusLineConfigured(settings: ClaudeSettings): boolean {
  const statusLine = settings.statusLine as Record<string, unknown> | undefined;
  if (!statusLine) return false;
  return (
    statusLine.type === 'command' &&
    typeof statusLine.command === 'string' &&
    statusLine.command.includes('ccstatus-glm')
  );
}
