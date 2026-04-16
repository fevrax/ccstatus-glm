import * as clack from '@clack/prompts';
import { loadConfig, CONFIG_PATH } from '../config/loader.js';
import { readSettings, isStatusLineConfigured, SETTINGS_PATH } from '../claude-settings/reader.js';
import { verifyInstallation } from '../claude-settings/verify.js';
import { t, initLocale } from '../i18n/index.js';

/**
 * 诊断命令 - 检查配置完整性
 */
export async function doctorCommand(): Promise<void> {
  const config = loadConfig();
  initLocale(config.locale);

  clack.intro(t('doctor.checking'));

  // 运行统一验证（包含脚本存在、权限、settings.json、脚本执行、disableAllHooks）
  const verification = verifyInstallation();

  // 额外检查：配置文件
  const { existsSync } = await import('node:fs');
  if (existsSync(CONFIG_PATH)) {
    try {
      loadConfig();
      clack.log.success(t('doctor.config.ok'));
    } catch {
      clack.log.warn(t('doctor.config.invalid'));
    }
  } else {
    clack.log.success(t('doctor.config.missing'));
  }

  // 检查 git
  const { execSync } = await import('node:child_process');
  try {
    execSync('git --version', { stdio: 'ignore' });
    clack.log.success(t('doctor.git.ok'));
  } catch {
    clack.log.warn(t('doctor.git.missing'));
  }

  // 输出验证结果
  for (const check of verification.checks) {
    if (check.passed) {
      clack.log.success(check.message);
    } else {
      clack.log.warn(check.message);
    }
  }

  const hasIssues = !verification.allPassed;
  if (hasIssues) {
    clack.note(
      'Run `npx ccstatus-glm init` to fix issues.',
      'Next steps',
    );
  }

  clack.outro(hasIssues ? 'Some issues found.' : 'All checks passed.');
}
