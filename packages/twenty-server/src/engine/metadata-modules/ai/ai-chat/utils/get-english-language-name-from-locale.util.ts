import { isNonEmptyString } from '@sniptt/guards';

export const getEnglishLanguageNameFromLocale = (locale: string): string => {
  const languageTag = locale.split('-')[0] ?? locale;

  try {
    const languageName = new Intl.DisplayNames(['en'], {
      type: 'language',
    }).of(languageTag);

    return isNonEmptyString(languageName) ? languageName : locale;
  } catch {
    return locale;
  }
};
