import { type DocumentationSupportedLanguage } from 'twenty-shared/constants';

import { WEBSITE_LOCALE_LIST } from './website-locale-list';

const WEBSITE_LOCALE_SET: ReadonlySet<string> = new Set(WEBSITE_LOCALE_LIST);

export const isWebsiteLocale = (
  value: string,
): value is DocumentationSupportedLanguage => WEBSITE_LOCALE_SET.has(value);
