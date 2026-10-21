import {
  APP_LOCALES,
  type AppLocale,
} from '@/translations/constants/AppLocales';
import { SOURCE_LOCALE } from '@/translations/constants/SourceLocale';
import { isDefined } from '@/utils/validation/isDefined';
import { isValidLocale } from '@/utils/validation/isValidLocale';

// Maps language codes to full locale keys in APP_LOCALES
// Example: 'fr' -> 'fr-FR', 'en' -> 'en'
const languageToLocaleMap = Object.keys(APP_LOCALES).reduce((map, locale) => {
  const language = (locale.split('-')[0] ?? locale).toLowerCase();

  // Only add to the map if not already added or if the current locale is the source locale
  // This ensures language codes map to their full locale version (e.g., 'es' -> 'es-ES')
  // but preserves 'en' -> 'en' since it's the source locale
  if (!map.has(language) || locale === SOURCE_LOCALE) {
    map.set(language, locale as AppLocale);
  }

  return map;
}, new Map<string, AppLocale>());

export const normalizeLocale = (value: string | null): AppLocale => {
  if (value === null) {
    return SOURCE_LOCALE;
  }

  if (isValidLocale(value)) {
    return value;
  }

  const caseInsensitiveMatch = Object.keys(APP_LOCALES).find(
    (locale) => locale.toLowerCase() === value.toLowerCase(),
  );
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch as AppLocale;
  }

  // Try matching just the language part (e.g., 'fr' -> 'fr-FR')
  const languageCode = value?.trim()
    ? (value.split('-')[0] ?? value).toLowerCase()
    : '';
  const languageLocale = languageToLocaleMap.get(languageCode);

  if (isDefined(languageLocale)) {
    return languageLocale;
  }

  return SOURCE_LOCALE;
};
