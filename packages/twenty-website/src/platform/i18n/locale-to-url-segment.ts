import { type AppLocale } from 'twenty-shared/translations';

// The source locale is served unprefixed; regional codes get a short segment.
const URL_SEGMENT_OVERRIDES: Partial<Record<AppLocale, string>> = {
  en: 'en',
  'fr-FR': 'fr',
  'es-ES': 'es',
};

export const localeToUrlSegment = (locale: AppLocale): string => {
  const segment = URL_SEGMENT_OVERRIDES[locale];
  if (segment === undefined) {
    // Fail at build time rather than shipping verbose URLs for a new locale.
    throw new Error(
      `No URL segment defined for locale "${locale}" — add it to URL_SEGMENT_OVERRIDES.`,
    );
  }
  return segment;
};
