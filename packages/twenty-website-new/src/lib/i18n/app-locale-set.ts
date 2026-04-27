import { APP_LOCALES, type AppLocale } from 'twenty-shared/translations';

const APP_LOCALE_VALUES: readonly AppLocale[] = Object.values(APP_LOCALES);

export const APP_LOCALE_BY_RAW: ReadonlyMap<string, AppLocale> = new Map(
  APP_LOCALE_VALUES.map((locale) => [locale, locale]),
);

export const APP_LOCALE_BY_LANGUAGE: ReadonlyMap<string, AppLocale> = (() => {
  const byLanguage = new Map<string, AppLocale>();
  for (const locale of APP_LOCALE_VALUES) {
    const [languageSubtag] = locale.split('-');
    if (languageSubtag === undefined) continue;
    const key = languageSubtag.toLowerCase();
    if (!byLanguage.has(key)) {
      byLanguage.set(key, locale);
    }
  }
  return byLanguage;
})();

export const APP_LOCALE_LIST: readonly AppLocale[] = APP_LOCALE_VALUES;
