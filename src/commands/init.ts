import * as clack from '@clack/prompts';
import {
  SEGMENT_DEFAULTS,
  COLOR_SCHEME_OPTIONS,
  type Config,
} from '../config/schema.js';
import { loadConfig, saveConfig } from '../config/loader.js';
import { writeStatusLine, installBinScript, isBinScriptInstalled } from '../claude-settings/writer.js';
import { verifyInstallation } from '../claude-settings/verify.js';
import { t, setLocale, detectLocale, type LocaleName } from '../i18n/index.js';
import { getAllSegments } from '../segments/registry.js';

/**
 * 渐进式配置向导
 */
export async function initCommand(): Promise<void> {
  // 初始语言检测
  const existingConfig = loadConfig();
  const detectedLocale = existingConfig.locale || detectLocale();
  setLocale(detectedLocale as LocaleName);

  // 欢迎界面
  clack.intro(t('init.welcome'));

  // Step 1: 语言选择
  const locale = await clack.select({
    message: t('init.language'),
    options: [
      { value: 'zh', label: '中文' },
      { value: 'en', label: 'English' },
    ],
    initialValue: detectedLocale,
  });

  if (clack.isCancel(locale)) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  setLocale(locale as LocaleName);

  // Step 2: 段选择
  const segmentOptions = getAllSegments().map((seg) => ({
    value: seg.name,
    label: t(`seg.${seg.name}`),
  }));

  const defaultSegments = existingConfig.segments || SEGMENT_DEFAULTS
    .filter((s) => s.defaultEnabled)
    .map((s) => s.name);

  const selectedSegments = await clack.multiselect({
    message: t('init.segments'),
    options: segmentOptions,
    initialValues: defaultSegments,
    required: false,
  });

  if (clack.isCancel(selectedSegments)) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  // Step 3: 配色方案
  const schemeOptions = COLOR_SCHEME_OPTIONS.map((s) => ({
    value: s.value,
    label: t(s.labelKey),
  }));

  const colorScheme = await clack.select({
    message: t('init.colorScheme'),
    options: schemeOptions,
    initialValue: existingConfig.colorScheme || 'default',
  });

  if (clack.isCancel(colorScheme)) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  // Step 4: GLM API 密钥
  const glmApiKey = await clack.text({
    message: t('init.glmApiKey'),
    placeholder: 'sk-...',
    initialValue: existingConfig.glm?.apiKey ?? '',
  });

  if (clack.isCancel(glmApiKey)) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  // Step 5: 缓存 TTL
  const cacheTtl = await clack.text({
    message: t('init.cacheTtl'),
    placeholder: '60',
    initialValue: String(existingConfig.glm?.cacheTtl ?? 60),
    validate: (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 10 || num > 3600) {
        return 'Value must be between 10 and 3600';
      }
    },
  });

  if (clack.isCancel(cacheTtl)) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  // Step 6: 高级设置（可选）
  const showAdvanced = await clack.confirm({
    message: t('init.advanced'),
    initialValue: false,
  });

  if (clack.isCancel(showAdvanced)) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  let separator = existingConfig.separator ?? ' | ';
  let barWidth = existingConfig.barWidth ?? 6;
  let dirShorten = existingConfig.dirShorten ?? 2;
  let gitShowSha = existingConfig.gitShowSha ?? false;

  if (showAdvanced) {
    const advSeparator = await clack.text({
      message: t('init.separator'),
      placeholder: ' | ',
      initialValue: separator,
    });
    if (!clack.isCancel(advSeparator)) separator = advSeparator;

    const advBarWidth = await clack.text({
      message: t('init.barWidth'),
      placeholder: '10',
      initialValue: String(barWidth),
      validate: (val) => {
        const num = Number(val);
        if (isNaN(num) || num < 4 || num > 40) return '4-40';
      },
    });
    if (!clack.isCancel(advBarWidth)) barWidth = Number(advBarWidth);

    const advDirShorten = await clack.text({
      message: t('init.dirShorten'),
      placeholder: '2',
      initialValue: String(dirShorten),
      validate: (val) => {
        const num = Number(val);
        if (isNaN(num) || num < 0 || num > 10) return '0-10';
      },
    });
    if (!clack.isCancel(advDirShorten)) dirShorten = Number(advDirShorten);

    const advGitShowSha = await clack.confirm({
      message: t('init.gitShowSha'),
      initialValue: gitShowSha,
    });
    if (!clack.isCancel(advGitShowSha)) gitShowSha = advGitShowSha;
  }

  // 确认
  const confirmResult = await clack.confirm({
    message: t('init.confirm'),
    initialValue: true,
  });

  if (clack.isCancel(confirmResult) || !confirmResult) {
    clack.cancel(t('error.cancelled'));
    return;
  }

  // 构建并保存配置
  const config: Config = {
    version: 1,
    locale: locale as 'en' | 'zh',
    segments: selectedSegments as string[] as Config['segments'],
    colorScheme: colorScheme as Config['colorScheme'],
    separator,
    barWidth,
    dirShorten,
    gitShowSha,
    glm: {
      apiKey: glmApiKey || existingConfig.glm?.apiKey || '',
      cacheTtl: Number(cacheTtl),
    },
  };

  // 保存配置
  const s = clack.spinner();
  s.start(t('config.saved'));
  saveConfig(config);
  s.stop(t('config.saved'));

  // 安装本地可执行脚本
  const alreadyInstalled = isBinScriptInstalled();
  s.start(alreadyInstalled ? t('install.updating') : t('install.copying'));
  const installResult = installBinScript();
  if (installResult.error) {
    s.stop(t('error.install.copy', installResult.error));
    clack.outro(t('error.install.copy', installResult.error));
    return;
  }
  s.stop(alreadyInstalled ? t('install.updated') : t('install.copied'));

  // 自动配置 Claude Code settings.json
  s.start(t('settings.configuring'));
  const result = writeStatusLine(installResult.command);
  if (result.success) {
    if (result.alreadyConfigured) {
      s.stop(t('settings.already_configured'));
    } else {
      s.stop(t('settings.configured') + '\n  ' + t('settings.configured.cmd', installResult.command));
    }
  } else {
    s.stop(t('error.settings.write') + (result.error ? `: ${result.error}` : ''));
    clack.outro(t('error.settings.write'));
    return;
  }

  // 安装后验证
  s.start('Verifying installation...');
  const verification = verifyInstallation();
  s.stop('Verification complete.');

  for (const check of verification.checks) {
    if (check.passed) {
      clack.log.success(check.message);
    } else {
      clack.log.warn(check.message);
    }
  }

  // 完成
  clack.outro(
    t('init.complete') + '\n\n'
    + '  ' + t('init.complete.restart') + '\n'
    + '  ' + t('init.complete.trust') + '\n'
    + '  ' + t('init.complete.doctor'),
  );
}
