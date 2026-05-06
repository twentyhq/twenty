import { type AppLocale } from 'twenty-shared/translations';

import { WEBSITE_LOCALE_LIST } from './website-locale-list';

const URL_SEGMENT_OVERRIDES: Partial<Record<AppLocale, string>> = {
  'fr-FR': 'fr',
};

export const localeToUrlSegment = (locale: AppLocale): string =>
  URL_SEGMENT_OVERRIDES[locale] ?? locale;

export const LOCALE_BY_URL_SEGMENT: ReadonlyMap<string, AppLocale> = new Map(
  WEBSITE_LOCALE_LIST.map((locale) => [localeToUrlSegment(locale), locale]),
);
