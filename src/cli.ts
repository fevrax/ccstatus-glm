import { cac } from 'cac';
import { runCommand } from './commands/run.js';
import { initCommand } from './commands/init.js';
import { configCommand } from './commands/config.js';
import { uninstallCommand } from './commands/uninstall.js';
import { doctorCommand } from './commands/doctor.js';

const cli = cac('ccstatus-glm');

cli.version('1.0.0').option('--locale <locale>', 'Override language (en | zh)');

// 默认命令：渲染状态栏（Claude Code 调用入口）
cli.command('', 'Render statusline from stdin').action(runCommand);

// 配置向导
cli.command('init', 'Run the configuration wizard').action(initCommand);

// 配置管理
cli
  .command('config [action] [key] [value]', 'Manage configuration')
  .action(configCommand);

// 卸载
cli.command('uninstall', 'Remove ccstatus-glm').action(uninstallCommand);

// 诊断
cli.command('doctor', 'Run diagnostics').action(doctorCommand);

cli.help();
cli.parse();
