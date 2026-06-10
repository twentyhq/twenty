import { type AppLocale } from 'twenty-shared/translations';

// The source locale is served unprefixed; regional codes get a short segment.
const URL_SEGMENT_OVERRIDES: Partial<Record<AppLocale, string>> = {
  'fr-FR': 'fr',
  'es-ES': 'es',
};

export const localeToUrlSegment = (locale: AppLocale): string =>
  URL_SEGMENT_OVERRIDES[locale] ?? locale;
