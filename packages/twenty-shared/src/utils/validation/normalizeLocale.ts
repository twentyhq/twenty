import {
  APP_LOCALES,
  type AppLocale,
} from '@/translations/constants/AppLocales';
import { SOURCE_LOCALE } from '@/translations/constants/SourceLocale';

// Maps language codes to full locale keys in APP_LOCALES
// Example: 'fr' -> 'fr-FR', 'en' -> 'en'
// Null-prototype dict: it is keyed by untrusted input below, so a normal object
// would resolve inherited keys like 'constructor' to Object.prototype members.
const languageToLocaleMap = Object.keys(APP_LOCALES).reduce<
  Record<string, string>
>(
  (map, locale) => {
    const language = locale.split('-')[0].toLowerCase();

    // Only add to the map if not already added or if the current locale is the source locale
    // This ensures language codes map to their full locale version (e.g., 'es' -> 'es-ES')
    // but preserves 'en' -> 'en' since it's the source locale
    if (!map[language] || locale === SOURCE_LOCALE) {
      map[language] = locale;
    }

    return map;
  },
  Object.create(null) as Record<string, string>,
);

export const normalizeLocale = (value: string | null): AppLocale => {
  if (value === null) {
    return SOURCE_LOCALE;
  }

  // `in` walks the prototype chain, so inherited Object keys like 'toString' or
  // 'constructor' would be treated as valid locales; check own keys only.
  if (Object.keys(APP_LOCALES).includes(value)) {
    return value as AppLocale;
  }

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
