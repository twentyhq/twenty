import { APP_LOCALES, SOURCE_LOCALE } from '@/translations';

/**
 * Maps language codes to full locale keys in APP_LOCALES
 * Example: 'fr' -> 'fr-FR', 'en' -> 'en'
 */
const languageToLocaleMap = Object.keys(APP_LOCALES).reduce<
  Record<string, string>
>((map, locale) => {
  // Extract the language code (part before the hyphen or the whole code if no hyphen)
  const language = locale.split('-')[0].toLowerCase();

  // Only add to the map if not already added or if the current locale is the source locale
  // This ensures language codes map to their full locale version (e.g., 'es' -> 'es-ES')
  // but preserves 'en' -> 'en' since it's the source locale
  if (!map[language] || locale === SOURCE_LOCALE) {
    map[language] = locale;
  }

  return map;
}, {});

/**
 * Normalizes a locale string to match our supported formats
 */
export const normalizeLocale = (
  value: string | null,
): keyof typeof APP_LOCALES => {
  if (value === null) {
    return SOURCE_LOCALE;
  }

  // Direct match in our supported locales
  if (value in APP_LOCALES) {
    return value as keyof typeof APP_LOCALES;
  }

  // Try case-insensitive match (e.g., 'fr-fr' -> 'fr-FR')
  const caseInsensitiveMatch = Object.keys(APP_LOCALES).find(
    (locale) => locale.toLowerCase() === value.toLowerCase(),
  );
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch as keyof typeof APP_LOCALES;
  }

  // Try matching just the language part (e.g., 'fr' -> 'fr-FR')
  const languageCode = value?.trim() ? value.split('-')[0].toLowerCase() : '';
  if (languageToLocaleMap[languageCode]) {
    return languageToLocaleMap[languageCode] as keyof typeof APP_LOCALES;
  }

  return SOURCE_LOCALE;
};
