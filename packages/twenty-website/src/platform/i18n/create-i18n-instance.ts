import { setupI18n, type I18n } from '@lingui/core';
import { type DocumentationSupportedLanguage } from 'twenty-shared/constants';

import { MESSAGES_BY_LOCALE } from './messages-by-locale';

export const createI18nInstance = (
  locale: DocumentationSupportedLanguage,
): I18n =>
  setupI18n({
    locale,
    messages: { [locale]: MESSAGES_BY_LOCALE[locale] },
  });
