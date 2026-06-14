// Public, everywhere-safe i18n surface (pure helpers + client components).
// Server-only runtime (getRouteI18n / getServerI18n / setServerI18n /
// createI18nInstance / getLocaleMessages) lives in `@/lib/i18n/server` and is
// intentionally NOT re-exported here so this barrel stays client-safe.

export {
  WEBSITE_LOCALE_LIST,
  isWebsiteLocale,
  localeToUrlSegment,
  resolveLocaleParam,
  localizeHref,
  stripLocale,
  getNativeLocaleName,
  getEnglishLocaleName,
  getMessageDescriptorSource,
} from './locales';

export { I18nProvider, useLocale, useUnlocalizedPathname } from './client';

export { LocalizedLink, LocalizedLinkButton } from './LocalizedLink';
