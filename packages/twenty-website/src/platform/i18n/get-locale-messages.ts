import { type Messages } from '@lingui/core';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { MESSAGES_BY_LOCALE } from './messages-by-locale';

export const getLocaleMessages = (locale: AppLocale): Messages =>
  MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE[SOURCE_LOCALE] ?? {};
