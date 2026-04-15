import * as clack from '@clack/prompts';
import { existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, CONFIG_PATH } from '../config/loader.js';
import { readSettings, isStatusLineConfigured, SETTINGS_PATH } from '../claude-settings/reader.js';
import { t, initLocale } from '../i18n/index.js';

const BIN_SCRIPT_PATH = join(homedir(), '.claude', 'bin', 'ccstatus-glm-statusline');

/**
 * 诊断命令 - 检查配置完整性
 */
export async function doctorCommand(): Promise<void> {
  const config = loadConfig();
  initLocale(config.locale);

  clack.intro(t('doctor.checking'));

  const results: Array<{ label: string; ok: boolean }> = [];

  // 检查配置文件
  if (existsSync(CONFIG_PATH)) {
    try {
      loadConfig();
      results.push({ label: t('doctor.config.ok'), ok: true });
    } catch {
      results.push({ label: t('doctor.config.invalid'), ok: false });
    }
  } else {
    results.push({ label: t('doctor.config.missing'), ok: true });
  }

  // 检查 Claude Code statusline 配置
  if (existsSync(SETTINGS_PATH)) {
    const settings = readSettings();
    if (isStatusLineConfigured(settings)) {
      results.push({ label: t('doctor.settings.ok'), ok: true });
    } else {
      const statusLine = settings.statusLine as Record<string, unknown> | undefined;
      if (statusLine) {
        results.push({ label: t('doctor.settings.invalid'), ok: false });
      } else {
        results.push({ label: t('doctor.settings.missing'), ok: false });
      }
    }
  } else {
    results.push({ label: t('doctor.settings.missing'), ok: false });
  }

  // 检查 git
  try {
    execSync('git --version', { stdio: 'ignore' });
    results.push({ label: t('doctor.git.ok'), ok: true });
  } catch {
    results.push({ label: t('doctor.git.missing'), ok: false });
  }

  // 检查本地 statusline 脚本
  if (existsSync(BIN_SCRIPT_PATH)) {
    try {
      const stat = statSync(BIN_SCRIPT_PATH);
      const isExecutable = (stat.mode & 0o111) !== 0;
      if (isExecutable) {
        results.push({ label: t('doctor.script.ok'), ok: true });
      } else {
        results.push({ label: t('doctor.script.missing'), ok: false });
      }
    } catch {
      results.push({ label: t('doctor.script.missing'), ok: false });
    }
  } else {
    results.push({ label: t('doctor.script.missing'), ok: false });
  }

  // 输出结果
  for (const r of results) {
    if (r.ok) {
      clack.log.success(r.label);
    } else {
      clack.log.warn(r.label);
    }
  }

  const hasIssues = results.some((r) => !r.ok);
  if (hasIssues) {
    clack.note(
      'Run `npx ccstatus-glm init` to fix issues.',
      'Next steps',
    );
  }

  clack.outro(hasIssues ? 'Some issues found.' : 'All checks passed.');
}
