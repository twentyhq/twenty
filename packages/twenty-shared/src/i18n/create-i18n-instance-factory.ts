import { setupI18n, type I18n, type Messages } from '@lingui/core';

import { type AppLocale } from '@/translations/constants/AppLocales';
import { SOURCE_LOCALE } from '@/translations/constants/SourceLocale';

export type LocaleMessagesMap = Partial<Record<AppLocale, Messages>>;

export const createI18nInstanceFactory = (
  messagesByLocale: LocaleMessagesMap,
) => {
  const cache: Partial<Record<AppLocale, I18n>> = {};

  return (locale: AppLocale): I18n => {
    const cached = cache[locale];
    if (cached !== undefined) {
      return cached;
    }

    const fallbackMessages = messagesByLocale[SOURCE_LOCALE] ?? {};
    const localeMessages = messagesByLocale[locale] ?? fallbackMessages;

    const i18n = setupI18n();
    i18n.load(locale, localeMessages);
    i18n.activate(locale);

    cache[locale] = i18n;
    return i18n;
  };
};
