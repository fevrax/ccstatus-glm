const en: Record<string, string> = {
  // Common
  'app.name': 'ccstatus-glm',
  'app.desc': 'A modular statusline for Claude Code with GLM API quota monitoring',

  // Commands
  'cmd.run.desc': 'Render statusline from stdin (default)',
  'cmd.init.desc': 'Run the configuration wizard',
  'cmd.config.desc': 'View or modify configuration',
  'cmd.config.get.desc': 'Get a config value',
  'cmd.config.set.desc': 'Set a config value',
  'cmd.config.reset.desc': 'Reset config to defaults',
  'cmd.uninstall.desc': 'Remove ccstatus-glm',
  'cmd.doctor.desc': 'Run diagnostics',

  // Init wizard
  'init.welcome': 'Welcome to ccstatus-glm setup!',
  'init.welcome.sub': 'A modular statusline for Claude Code',
  'init.language': 'Select your language',
  'init.segments': 'Choose which segments to display',
  'init.colorScheme': 'Select a color scheme',
  'init.glmApiKey': 'Enter your GLM API key (leave empty to skip)',
  'init.cacheTtl': 'Cache refresh interval (seconds)',
  'init.advanced': 'Advanced settings',
  'init.separator': 'Segment separator',
  'init.barWidth': 'Context bar width (characters)',
  'init.dirShorten': 'Directory depth to show',
  'init.gitShowSha': 'Show git short SHA after branch name?',
  'init.gitDetailed': 'Show detailed git status (staged/modified/untracked counts)?',
  'init.gitCacheTtl': 'Git cache refresh interval (seconds, 1-60)',
  'init.confirm': 'Ready to apply configuration?',
  'init.complete': 'Configuration complete!',
  'init.complete.next': 'Restart Claude Code to see the new statusline.',

  // Segments
  'seg.model': 'Model name',
  'seg.directory': 'Directory',
  'seg.git': 'Git branch',
  'seg.context': 'Context usage',
  'seg.cost': 'Session cost',
  'seg.session': 'Session duration',
  'seg.output_style': 'Output style',
  'seg.glm_quota': 'GLM quota',

  // Color schemes
  'scheme.default': 'Default (ANSI 256-color)',
  'scheme.tokyo_night': 'Tokyo Night',
  'scheme.nord': 'Nord',
  'scheme.catppuccin': 'Catppuccin Mocha',
  'scheme.dracula': 'Dracula',

  // Config
  'config.show': 'Current configuration',
  'config.saved': 'Configuration saved.',
  'config.reset.confirm': 'Reset all settings to defaults?',
  'config.reset.done': 'Configuration reset to defaults.',

  // Install
  'install.copying': 'Installing local script...',
  'install.copied': 'Local script installed.',
  'install.updating': 'Updating local script...',
  'install.updated': 'Local script updated.',

  // Settings
  'settings.configuring': 'Configuring Claude Code statusline...',
  'settings.configured': 'Claude Code statusline configured successfully.',
  'settings.configured.cmd': 'Statusline command: {0}',
  'settings.already_configured': 'Claude Code statusline is already configured.',
  'settings.backup.created': 'Settings backup created.',

  // Uninstall
  'uninstall.confirm': 'Are you sure you want to uninstall ccstatus-glm?',
  'uninstall.removing': 'Removing ccstatus-glm...',
  'uninstall.done': 'ccstatus-glm has been uninstalled.',

  // Doctor
  'doctor.checking': 'Running diagnostics...',
  'doctor.config.ok': 'Config file: OK',
  'doctor.config.missing': 'Config file: MISSING (using defaults)',
  'doctor.config.invalid': 'Config file: INVALID',
  'doctor.settings.ok': 'Claude Code statusline: OK',
  'doctor.settings.missing': 'Claude Code statusline: NOT CONFIGURED',
  'doctor.settings.invalid': 'Claude Code statusline: MISCONFIGURED',
  'doctor.script.ok': 'Statusline script: OK',
  'doctor.script.missing': 'Statusline script: MISSING (re-run init)',
  'doctor.git.ok': 'Git: available',
  'doctor.git.missing': 'Git: NOT FOUND',

  // Errors
  'error.stdin': 'No input received from stdin.',
  'error.config.read': 'Failed to read config file.',
  'error.config.write': 'Failed to write config file.',
  'error.settings.read': 'Failed to read Claude Code settings.',
  'error.settings.write': 'Failed to write Claude Code settings.',
  'error.install.copy': 'Failed to install local script: {0}',
  'error.cancelled': 'Operation cancelled.',

  // Verification
  'verify.script.ok': 'Script file: OK',
  'verify.script.missing': 'Script not found at {0}',
  'verify.script.not_executable': 'Script is not executable',
  'verify.script.run_ok': 'Script execution: OK',
  'verify.script.run_fail': 'Script execution failed: {0}',
  'verify.settings.ok': 'StatusLine config: OK',
  'verify.settings.not_found': 'settings.json not created',
  'verify.settings.wrong_command': 'statusLine command mismatch',
  'verify.hooks_disabled': 'disableAllHooks is enabled — status line will not run',

  // Init completion hints
  'init.complete.trust': 'Accept the workspace trust dialog when opening a project in Claude Code.',
  'init.complete.doctor': 'Run "npx ccstatus-glm doctor" to verify installation.',
  'init.complete.restart': 'Restart Claude Code to see the new statusline.',
};

export default en;
