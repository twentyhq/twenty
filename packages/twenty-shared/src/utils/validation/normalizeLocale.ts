import {
  APP_LOCALES,
  type AppLocale,
} from '@/translations/constants/AppLocales';
import { SOURCE_LOCALE } from '@/translations/constants/SourceLocale';

// Maps language codes to full locale keys in APP_LOCALES
// Example: 'fr' -> 'fr-FR', 'en' -> 'en'
const languageToLocaleMap = Object.keys(APP_LOCALES).reduce<
  Record<string, string>
>((map, locale) => {
  const language = locale.split('-')[0].toLowerCase();

  // Only add to the map if not already added or if the current locale is the source locale
  // This ensures language codes map to their full locale version (e.g., 'es' -> 'es-ES')
  // but preserves 'en' -> 'en' since it's the source locale
  if (!map[language] || locale === SOURCE_LOCALE) {
    map[language] = locale;
  }

  return map;
}, {});

export const normalizeLocale = (value: string | null): AppLocale => {
  if (value === null) {
    return SOURCE_LOCALE;
  }

  // Direct match in our supported locales
  if (value in APP_LOCALES) {
    return value as AppLocale;
  }

  // Try case-insensitive match (e.g., 'fr-fr' -> 'fr-FR')
  const caseInsensitiveMatch = Object.keys(APP_LOCALES).find(
    (locale) => locale.toLowerCase() === value.toLowerCase(),
  );
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch as AppLocale;
  }

  // Try matching just the language part (e.g., 'fr' -> 'fr-FR')
  const languageCode = value?.trim() ? value.split('-')[0].toLowerCase() : '';
  if (languageToLocaleMap[languageCode]) {
    return languageToLocaleMap[languageCode] as AppLocale;
  }

  return SOURCE_LOCALE;
};
