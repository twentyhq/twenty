import { type AppLocale } from 'twenty-shared/translations';

import { WEBSITE_LOCALE_LIST } from './website-locale-list';

const WEBSITE_LOCALE_SET: ReadonlySet<AppLocale> = new Set(WEBSITE_LOCALE_LIST);

export const isWebsiteLocale = (locale: AppLocale): boolean =>
  WEBSITE_LOCALE_SET.has(locale);
