import { type AppLocale } from 'twenty-shared/translations';

import { localeToUrlSegment } from './locale-to-url-segment';
import { WEBSITE_LOCALE_LIST } from './website-locale-list';

export const LOCALE_BY_URL_SEGMENT: ReadonlyMap<string, AppLocale> = new Map(
  WEBSITE_LOCALE_LIST.map((locale) => [localeToUrlSegment(locale), locale]),
);
