import { type AppLocale } from 'twenty-shared/translations';

const languageCode = (locale: AppLocale): string => locale.split('-')[0];

const capitalizeFirst = (value: string): string =>
  value.length === 0
    ? value
    : value.charAt(0).toLocaleUpperCase() + value.slice(1);

export const localeDisplayName: {
  native: (locale: AppLocale) => string;
  english: (locale: AppLocale) => string;
} = {
  native: (locale) => {
    const display = new Intl.DisplayNames([locale], { type: 'language' });
    return capitalizeFirst(display.of(languageCode(locale)) ?? locale);
  },
  english: (locale) => {
    const display = new Intl.DisplayNames(['en'], { type: 'language' });
    return display.of(languageCode(locale)) ?? locale;
  },
};
