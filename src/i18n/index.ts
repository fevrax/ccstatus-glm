import en from './locales/en.js';
import zh from './locales/zh.js';

const locales = { en, zh } as const;
type LocaleName = keyof typeof locales;
type LocaleKey = keyof typeof en;

let currentLocale: LocaleName = 'en';

/**
 * 设置当前语言
 */
export function setLocale(locale: LocaleName): void {
  if (locales[locale]) {
    currentLocale = locale;
  }
}

/**
 * 获取当前语言
 */
export function getLocale(): LocaleName {
  return currentLocale;
}

/**
 * 获取翻译文本，自动回退到英文
 */
export function t(key: string, ...args: unknown[]): string {
  const str =
    (locales[currentLocale]?.[key as keyof typeof zh] ?? en[key as LocaleKey]) ??
    key;
  return args.reduce(
    (s, arg, i) => s.replace(`{${i}}`, String(arg)),
    str,
  );
}

/**
 * 根据环境自动检测语言
 */
export function detectLocale(): LocaleName {
  const lang = process.env.LANG ?? process.env.LC_ALL ?? '';
  if (lang.toLowerCase().includes('zh')) return 'zh';
  return 'en';
}

/**
 * 从配置或环境初始化语言
 */
export function initLocale(configuredLocale?: string): void {
  if (configuredLocale && locales[configuredLocale as LocaleName]) {
    setLocale(configuredLocale as LocaleName);
  } else {
    setLocale(detectLocale());
  }
}
