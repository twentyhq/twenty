import { APP_LOCALES, type AppLocale } from 'twenty-shared/translations';

import { WEBSITE_LOCALE_LIST } from './website-locale-list';

export { WEBSITE_LOCALE_LIST } from './website-locale-list';

const APP_LOCALE_VALUES: readonly AppLocale[] = Object.values(APP_LOCALES);

const isKnownPublicLocale = (locale: AppLocale): boolean =>
  !locale.startsWith('pseudo-');

export const KNOWN_PUBLIC_APP_LOCALE_LIST: readonly AppLocale[] =
  APP_LOCALE_VALUES.filter(isKnownPublicLocale);

const WEBSITE_LOCALE_SET: ReadonlySet<AppLocale> = new Set(WEBSITE_LOCALE_LIST);

export const isPublicAppLocale = (locale: AppLocale): boolean =>
  WEBSITE_LOCALE_SET.has(locale);

export const APP_LOCALE_LIST: readonly AppLocale[] = APP_LOCALE_VALUES;

export const PUBLIC_APP_LOCALE_LIST: readonly AppLocale[] = WEBSITE_LOCALE_LIST;

export const KNOWN_PUBLIC_APP_LOCALE_BY_RAW: ReadonlyMap<string, AppLocale> =
  new Map(KNOWN_PUBLIC_APP_LOCALE_LIST.map((locale) => [locale, locale]));

export const APP_LOCALE_BY_RAW: ReadonlyMap<string, AppLocale> = new Map(
  PUBLIC_APP_LOCALE_LIST.map((locale) => [locale, locale]),
);

export const APP_LOCALE_BY_LANGUAGE: ReadonlyMap<string, AppLocale> = (() => {
  const byLanguage = new Map<string, AppLocale>();
  for (const locale of PUBLIC_APP_LOCALE_LIST) {
    const [languageSubtag] = locale.split('-');
    if (languageSubtag === undefined) continue;
    const key = languageSubtag.toLowerCase();
    if (!byLanguage.has(key)) {
      byLanguage.set(key, locale);
    }
  }
  return byLanguage;
})();
