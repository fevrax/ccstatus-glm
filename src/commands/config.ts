import * as clack from '@clack/prompts';
import { loadConfig, updateConfig, resetConfig, type Config } from '../config/loader.js';
import { t, initLocale } from '../i18n/index.js';

type ConfigAction = 'get' | 'set' | 'reset' | undefined;

/**
 * 配置管理命令
 */
export async function configCommand(
  action?: ConfigAction,
  key?: string,
  value?: string,
): Promise<void> {
  const config = loadConfig();
  initLocale(config.locale);

  // 无参数时显示当前配置
  if (!action) {
    clack.note(formatConfig(config), t('config.show'));
    return;
  }

  switch (action) {
    case 'get': {
      if (!key) {
        clack.log.error('Usage: ccstatus-glm config get <key>');
        return;
      }
      const val = getNestedValue(config, key);
      if (val !== undefined) {
        console.log(JSON.stringify(val, null, 2));
      } else {
        clack.log.error(`Key not found: ${key}`);
      }
      break;
    }

    case 'set': {
      if (!key || value === undefined) {
        clack.log.error('Usage: ccstatus-glm config set <key> <value>');
        return;
      }
      try {
        const parsed = parseValue(value);
        const partial = setNestedValue(config, key, parsed);
        updateConfig(partial);
        clack.log.success(t('config.saved'));
      } catch (err) {
        clack.log.error(`Failed to set ${key}: ${(err as Error).message}`);
      }
      break;
    }

    case 'reset': {
      const confirmed = await clack.confirm({
        message: t('config.reset.confirm'),
        initialValue: false,
      });
      if (clack.isCancel(confirmed) || !confirmed) {
        clack.cancel(t('error.cancelled'));
        return;
      }
      resetConfig();
      clack.log.success(t('config.reset.done'));
      break;
    }

    default:
      clack.log.error(`Unknown action: ${action}`);
  }
}

/**
 * 格式化配置为可读文本
 */
function formatConfig(config: Config): string {
  const lines: string[] = [];
  lines.push(`locale:       ${config.locale}`);
  lines.push(`colorScheme:  ${config.colorScheme}`);
  lines.push(`segments:     [${config.segments.join(', ')}]`);
  lines.push(`separator:    "${config.separator}"`);
  lines.push(`barWidth:     ${config.barWidth}`);
  lines.push(`dirShorten:   ${config.dirShorten}`);
  lines.push(`gitShowSha:   ${config.gitShowSha}`);
  lines.push(`gitDetailed:  ${config.gitDetailed}`);
  lines.push(`gitCacheTtl:  ${config.gitCacheTtl}`);
  lines.push(`glm.apiKey:   ${config.glm.apiKey ? '••••••' : '(not set)'}`);
  lines.push(`glm.cacheTtl: ${config.glm.cacheTtl}`);
  return lines.join('\n');
}

/**
 * 获取嵌套属性值（支持 dot notation）
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const k of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[k];
  }
  return current;
}

/**
 * 设置嵌套属性值（返回 partial 对象用于 updateConfig）
 */
function setNestedValue(
  _config: Record<string, unknown>,
  path: string,
  value: unknown,
): Partial<Config> {
  const keys = path.split('.');
  if (keys.length === 1) {
    return { [keys[0]]: value } as Partial<Config>;
  }
  // 嵌套对象，如 glm.apiKey → { glm: { apiKey: value } }
  const result: Record<string, unknown> = {};
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = {};
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return result as Partial<Config>;
}

/**
 * 解析字符串值为合适的类型
 */
function parseValue(val: string): unknown {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null') return null;
  const num = Number(val);
  if (!isNaN(num) && val.trim() !== '') return num;
  // 尝试解析 JSON 数组
  if (val.startsWith('[')) {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}
