import * as clack from '@clack/prompts';
import { existsSync, unlinkSync } from 'node:fs';
import { CONFIG_PATH } from '../config/loader.js';
import { removeStatusLine } from '../claude-settings/writer.js';
import { restoreSettings } from '../claude-settings/backup.js';
import { t, initLocale } from '../i18n/index.js';
import { loadConfig } from '../config/loader.js';

const CACHE_FILE = '/tmp/ccstatus-glm-quota.txt';

/**
 * 卸载命令
 */
export async function uninstallCommand(): Promise<void> {
  const config = loadConfig();
  initLocale(config.locale);

  const confirmed = await clack.confirm({
    message: t('uninstall.confirm'),
    initialValue: false,
  });

  if (clack.isCancel(confirmed) || !confirmed) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  const s = clack.spinner();
  s.start(t('uninstall.removing'));

  // 1. 移除 settings.json 中的 statusLine
  const removed = removeStatusLine();

  // 2. 尝试恢复备份
  restoreSettings();

  // 3. 删除配置文件
  if (existsSync(CONFIG_PATH)) {
    try {
      unlinkSync(CONFIG_PATH);
    } catch {
      // 忽略
    }
  }

  // 4. 清除缓存
  if (existsSync(CACHE_FILE)) {
    try {
      unlinkSync(CACHE_FILE);
    } catch {
      // 忽略
    }
  }

  s.stop(t('uninstall.done'));
}
