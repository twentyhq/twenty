import { type AppLocale } from 'twenty-shared/translations';

const displayNamesCache = new Map<string, Intl.DisplayNames>();

const getDisplayNames = (displayLocale: string): Intl.DisplayNames | null => {
  const cached = displayNamesCache.get(displayLocale);
  if (cached !== undefined) return cached;
  try {
    const instance = new Intl.DisplayNames([displayLocale], {
      type: 'language',
    });
    displayNamesCache.set(displayLocale, instance);
    return instance;
  } catch {
    return null;
  }
};

const languageCode = (locale: AppLocale): string => locale.split('-')[0];

const capitalizeFirstChar = (value: string): string => {
  if (value.length === 0) return value;
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
};

export const getNativeLocaleName = (locale: AppLocale): string => {
  const display = getDisplayNames(locale);
  if (display === null) return locale;
  const name = display.of(languageCode(locale));
  if (name === undefined) return locale;
  return capitalizeFirstChar(name);
};

export const getEnglishLocaleName = (locale: AppLocale): string => {
  const display = getDisplayNames('en');
  if (display === null) return locale;
  return display.of(languageCode(locale)) ?? locale;
};
