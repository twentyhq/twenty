import { setupI18n, type I18n } from '@lingui/core';
import { type AppLocale } from 'twenty-shared/translations';

import { getLocaleMessages } from './get-locale-messages';

export const createI18nInstance = (locale: AppLocale): I18n =>
  setupI18n({
    locale,
    messages: { [locale]: getLocaleMessages(locale) },
  });
