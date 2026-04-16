import { existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { readSettings, isStatusLineConfigured, SETTINGS_PATH } from './reader.js';
import { BIN_SCRIPT_COMMAND } from './writer.js';

const BIN_SCRIPT_PATH = join(homedir(), '.claude', 'bin', 'ccstatus-glm');

/** 单项验证结果 */
export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

/** 验证总结果 */
export interface VerificationResult {
  checks: CheckResult[];
  allPassed: boolean;
}

/** Mock stdin 数据，用于测试脚本是否能正常执行 */
const MOCK_STDIN = JSON.stringify({
  session_id: 'verify-test',
  cwd: '/tmp',
  model: { id: 'test', display_name: 'Test' },
  workspace: { current_dir: '/tmp', project_dir: '/tmp', added_dirs: [] },
  cost: { total_cost_usd: 0, total_duration_ms: 0, total_api_duration_ms: 0, total_lines_added: 0, total_lines_removed: 0 },
  context_window: {
    total_input_tokens: 0,
    total_output_tokens: 0,
    context_window_size: 200000,
    current_usage: null,
    used_percentage: 0,
    remaining_percentage: 100,
  },
  exceeds_200k_tokens: false,
  version: '0.0.0',
  output_style: { name: 'default' },
});

/**
 * 验证 ccstatus-glm 安装完整性
 *
 * 执行一系列检查：脚本文件存在、可执行权限、settings.json 配置、
 * 脚本实际执行、disableAllHooks 状态。
 */
export function verifyInstallation(): VerificationResult {
  const checks: CheckResult[] = [];

  // 1. 脚本文件存在
  const scriptExists = existsSync(BIN_SCRIPT_PATH);
  checks.push({
    name: 'script.exists',
    passed: scriptExists,
    message: scriptExists ? 'Script file: OK' : `Script not found at ${BIN_SCRIPT_PATH}`,
  });

  // 2. 脚本可执行
  if (scriptExists) {
    try {
      const stat = statSync(BIN_SCRIPT_PATH);
      const isExecutable = (stat.mode & 0o111) !== 0;
      checks.push({
        name: 'script.executable',
        passed: isExecutable,
        message: isExecutable ? 'Script permissions: OK' : 'Script is not executable',
      });
    } catch {
      checks.push({
        name: 'script.executable',
        passed: false,
        message: 'Cannot check script permissions',
      });
    }
  }

  // 3. settings.json 存在
  const settingsExists = existsSync(SETTINGS_PATH);
  checks.push({
    name: 'settings.exists',
    passed: settingsExists,
    message: settingsExists ? 'settings.json: OK' : 'settings.json not found',
  });

  // 4. statusLine 配置正确
  if (settingsExists) {
    const settings = readSettings();
    const configured = isStatusLineConfigured(settings);

    if (configured) {
      const statusLine = settings.statusLine as Record<string, unknown>;
      const cmdMatch = statusLine.command === BIN_SCRIPT_COMMAND;
      checks.push({
        name: 'settings.statusline',
        passed: true,
        message: cmdMatch ? 'StatusLine config: OK' : `StatusLine command mismatch (expected ${BIN_SCRIPT_COMMAND})`,
      });
    } else {
      checks.push({
        name: 'settings.statusline',
        passed: false,
        message: 'statusLine not configured in settings.json',
      });
    }

    // 5. disableAllHooks 检查
    if (settings.disableAllHooks === true) {
      checks.push({
        name: 'settings.hooks',
        passed: false,
        message: 'disableAllHooks is enabled — status line will not run',
      });
    }
  }

  // 6. 脚本可实际运行（仅当脚本存在且可执行时测试）
  const scriptOk = checks.find((c) => c.name === 'script.executable')?.passed;
  if (scriptOk) {
    try {
      const result = execSync(
        `echo '${MOCK_STDIN.replace(/'/g, "'\\''")}' | "${BIN_SCRIPT_PATH}"`,
        {
          timeout: 5000,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );
      const hasOutput = result.trim().length > 0;
      checks.push({
        name: 'script.execution',
        passed: hasOutput,
        message: hasOutput ? 'Script execution: OK' : 'Script produced no output',
      });
    } catch (err) {
      const errMsg = (err as Error).message.split('\n')[0];
      checks.push({
        name: 'script.execution',
        passed: false,
        message: `Script execution failed: ${errMsg}`,
      });
    }
  }

  const allPassed = checks.every((c) => c.passed);
  return { checks, allPassed };
}
