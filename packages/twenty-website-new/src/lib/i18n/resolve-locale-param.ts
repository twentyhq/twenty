import { notFound } from 'next/navigation';
import { type AppLocale } from 'twenty-shared/translations';

import { LOCALE_BY_URL_SEGMENT } from './website-locale-segments';

export const resolveLocaleParam = (raw: string): AppLocale => {
  const locale = LOCALE_BY_URL_SEGMENT.get(raw);
  if (locale === undefined) notFound();
  return locale;
};
