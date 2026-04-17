const zh: Record<string, string> = {
  // Common
  'app.name': 'ccstatus-glm',
  'app.desc': 'Claude Code 模块化状态栏，支持 GLM API 配额监控',

  // Commands
  'cmd.run.desc': '从 stdin 读取并渲染状态栏（默认命令）',
  'cmd.init.desc': '运行配置向导',
  'cmd.config.desc': '查看或修改配置',
  'cmd.config.get.desc': '获取配置值',
  'cmd.config.set.desc': '设置配置值',
  'cmd.config.reset.desc': '重置为默认配置',
  'cmd.uninstall.desc': '卸载 ccstatus-glm',
  'cmd.doctor.desc': '运行诊断检查',

  // Init wizard
  'init.welcome': 'ccstatus-glm setup',
  'init.welcome.sub': 'Claude Code 模块化状态栏工具',
  'init.language': '选择语言',
  'init.segments': '选择要显示的模块',
  'init.colorScheme': '选择配色方案',
  'init.glmApiKey': '输入 GLM API 密钥（留空跳过）',
  'init.cacheTtl': '缓存刷新间隔（秒）',
  'init.advanced': '高级设置',
  'init.separator': '段分隔符',
  'init.barWidth': '上下文进度条宽度（字符数）',
  'init.dirShorten': '目录显示深度',
  'init.gitShowSha': '是否在分支名后显示 Git 短 SHA？',
  'init.gitDetailed': '显示详细 Git 状态（暂存/修改/未跟踪文件数）？',
  'init.gitCacheTtl': 'Git 缓存刷新间隔（秒，1-60）',
  'init.confirm': '确认应用配置？',
  'init.complete': '配置完成！',
  'init.complete.next': '重启 Claude Code 即可看到新的状态栏。',

  // Segments
  'seg.model': '模型名称',
  'seg.directory': '工作目录',
  'seg.git': 'Git 分支',
  'seg.context': '上下文使用率',
  'seg.cost': '会话费用',
  'seg.session': '会话时长',
  'seg.output_style': '输出风格',
  'seg.glm_quota': 'GLM 配额',

  // Color schemes
  'scheme.default': '默认（ANSI 256 色）',
  'scheme.tokyo_night': 'Tokyo Night',
  'scheme.nord': 'Nord',
  'scheme.catppuccin': 'Catppuccin Mocha',
  'scheme.dracula': 'Dracula',

  // Config
  'config.show': '当前配置',
  'config.saved': '配置已保存。',
  'config.reset.confirm': '确定重置所有设置为默认值？',
  'config.reset.done': '配置已重置为默认值。',

  // Install
  'install.copying': '正在安装本地脚本...',
  'install.copied': '本地脚本安装完成。',
  'install.updating': '正在更新本地脚本...',
  'install.updated': '本地脚本已更新。',

  // Settings
  'settings.configuring': '正在配置 Claude Code 状态栏...',
  'settings.configured': 'Claude Code 状态栏配置成功。',
  'settings.configured.cmd': '状态栏命令：{0}',
  'settings.already_configured': 'Claude Code 状态栏已配置。',
  'settings.backup.created': '设置备份已创建。',

  // Uninstall
  'uninstall.confirm': '确定要卸载 ccstatus-glm 吗？',
  'uninstall.removing': '正在卸载 ccstatus-glm...',
  'uninstall.done': 'ccstatus-glm 已卸载。',

  // Doctor
  'doctor.checking': '正在运行诊断...',
  'doctor.config.ok': '配置文件：正常',
  'doctor.config.missing': '配置文件：缺失（使用默认值）',
  'doctor.config.invalid': '配置文件：无效',
  'doctor.settings.ok': 'Claude Code 状态栏：已配置',
  'doctor.settings.missing': 'Claude Code 状态栏：未配置',
  'doctor.settings.invalid': 'Claude Code 状态栏：配置错误',
  'doctor.script.ok': '状态栏脚本：正常',
  'doctor.script.missing': '状态栏脚本：缺失（请重新运行 init）',
  'doctor.git.ok': 'Git：可用',
  'doctor.git.missing': 'Git：未安装',

  // Errors
  'error.stdin': '未收到 stdin 输入。',
  'error.config.read': '读取配置文件失败。',
  'error.config.write': '写入配置文件失败。',
  'error.settings.read': '读取 Claude Code 设置失败。',
  'error.settings.write': '写入 Claude Code 设置失败。',
  'error.install.copy': '安装本地脚本失败：{0}',
  'error.cancelled': '操作已取消。',

  // Verification
  'verify.script.ok': '脚本文件：正常',
  'verify.script.missing': '脚本未找到：{0}',
  'verify.script.not_executable': '脚本不可执行',
  'verify.script.run_ok': '脚本执行：正常',
  'verify.script.run_fail': '脚本执行失败：{0}',
  'verify.settings.ok': 'StatusLine 配置：正常',
  'verify.settings.not_found': 'settings.json 未创建',
  'verify.settings.wrong_command': 'statusLine 命令不匹配',
  'verify.hooks_disabled': 'disableAllHooks 已启用 — status line 将被禁用',

  // Init completion hints
};

export default zh;
