import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { ConfigSchema, DEFAULT_CONFIG, type Config } from './schema.js';

/**
 * 配置文件目录
 */
const CLAUDE_DIR = join(homedir(), '.claude');

/**
 * 配置文件路径
 */
export const CONFIG_PATH = join(CLAUDE_DIR, 'ccstatus-glm.json');

/**
 * 加载配置文件
 * - 文件不存在时返回默认配置
 * - 文件内容无效时返回默认配置并打印警告
 */
export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return ConfigSchema.parse(parsed);
  } catch {
    console.error('[ccstatus-glm] Config file is invalid, using defaults.');
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * 保存配置到文件
 */
export function saveConfig(config: Config): void {
  if (!existsSync(CLAUDE_DIR)) {
    mkdirSync(CLAUDE_DIR, { recursive: true });
  }

  const json = JSON.stringify(config, null, 2) + '\n';
  writeFileSync(CONFIG_PATH, json, 'utf-8');
}

/**
 * 更新配置（合并部分字段）
 */
export function updateConfig(partial: Partial<Config>): Config {
  const current = loadConfig();
  const merged = { ...current, ...partial };

  // 处理嵌套的 glm 对象
  if (partial.glm) {
    merged.glm = { ...current.glm, ...partial.glm };
  }

  const validated = ConfigSchema.parse(merged);
  saveConfig(validated);
  return validated;
}

/**
 * 重置配置为默认值
 */
export function resetConfig(): Config {
  saveConfig({ ...DEFAULT_CONFIG });
  return { ...DEFAULT_CONFIG };
}
