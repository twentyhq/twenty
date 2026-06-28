import { type DocumentationSupportedLanguage } from 'twenty-shared/constants';

const capitalizeFirst = (value: string): string =>
  value.length === 0
    ? value
    : value.charAt(0).toLocaleUpperCase() + value.slice(1);

export const localeDisplayName: {
  native: (locale: DocumentationSupportedLanguage) => string;
  english: (locale: DocumentationSupportedLanguage) => string;
} = {
  native: (locale) => {
    const display = new Intl.DisplayNames([locale], { type: 'language' });
    return capitalizeFirst(display.of(locale) ?? locale);
  },
  english: (locale) => {
    const display = new Intl.DisplayNames(['en'], { type: 'language' });
    return display.of(locale) ?? locale;
  },
};
