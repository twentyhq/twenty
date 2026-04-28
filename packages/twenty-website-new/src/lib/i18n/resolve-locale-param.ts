import { notFound } from 'next/navigation';
import { type AppLocale } from 'twenty-shared/translations';

import { APP_LOCALE_BY_RAW } from './app-locale-set';

export const resolveLocaleParam = (raw: string): AppLocale => {
  const locale = APP_LOCALE_BY_RAW.get(raw);
  if (locale === undefined) notFound();
  return locale;
};
