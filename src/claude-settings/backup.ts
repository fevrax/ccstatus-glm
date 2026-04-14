import { copyFileSync, existsSync } from 'node:fs';
import { SETTINGS_PATH } from './reader.js';

const BACKUP_PATH = `${SETTINGS_PATH}.ccstatus-glm.bak`;

/**
 * 备份 settings.json
 */
export function backupSettings(): boolean {
  if (!existsSync(SETTINGS_PATH)) return false;
  try {
    copyFileSync(SETTINGS_PATH, BACKUP_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * 从备份恢复 settings.json
 */
export function restoreSettings(): boolean {
  if (!existsSync(BACKUP_PATH)) return false;
  try {
    copyFileSync(BACKUP_PATH, SETTINGS_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * 备份文件是否存在
 */
export function backupExists(): boolean {
  return existsSync(BACKUP_PATH);
}
