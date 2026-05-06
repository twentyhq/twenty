import { type Messages } from '@lingui/core';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { messages as enMessages } from '@/locales/generated/en';
import { messages as frMessages } from '@/locales/generated/fr-FR';

const MESSAGES_BY_LOCALE: Partial<Record<AppLocale, Messages>> = {
  en: enMessages,
  'fr-FR': frMessages,
};

export const getLocaleMessages = (locale: AppLocale): Messages =>
  MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE[SOURCE_LOCALE] ?? {};

export { MESSAGES_BY_LOCALE };
