import { notFound } from 'next/navigation';
import { type AppLocale } from 'twenty-shared/translations';

import { LOCALE_BY_URL_SEGMENT } from './locale-by-url-segment';

// The only sanctioned way to turn a raw [locale] route param into an
// AppLocale. Unknown segments 404.
export const resolveLocaleParam = (raw: string): AppLocale => {
  const locale = LOCALE_BY_URL_SEGMENT.get(raw);
  if (locale === undefined) notFound();
  return locale;
};
