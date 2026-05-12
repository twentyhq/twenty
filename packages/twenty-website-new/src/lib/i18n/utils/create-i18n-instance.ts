import { createI18nInstanceFactory } from 'twenty-shared/i18n';

import { MESSAGES_BY_LOCALE } from './messages-by-locale';

export const createI18nInstance = createI18nInstanceFactory(MESSAGES_BY_LOCALE);
