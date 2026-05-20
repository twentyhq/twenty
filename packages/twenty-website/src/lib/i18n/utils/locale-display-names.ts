import { type AppLocale } from 'twenty-shared/translations';

const languageCode = (locale: AppLocale): string => locale.split('-')[0];

const capitalizeFirstChar = (value: string): string =>
  value.length === 0
    ? value
    : value.charAt(0).toLocaleUpperCase() + value.slice(1);

export const getNativeLocaleName = (locale: AppLocale): string => {
  const display = new Intl.DisplayNames([locale], { type: 'language' });
  const name = display.of(languageCode(locale)) ?? locale;
  return capitalizeFirstChar(name);
};

export const getEnglishLocaleName = (locale: AppLocale): string => {
  const display = new Intl.DisplayNames(['en'], { type: 'language' });
  return display.of(languageCode(locale)) ?? locale;
};
