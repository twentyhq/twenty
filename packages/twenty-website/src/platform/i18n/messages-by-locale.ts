import { type Messages } from '@lingui/core';
import { type AppLocale } from 'twenty-shared/translations';

import { messages as enMessages } from '@/locales/generated/en';
import { messages as esMessages } from '@/locales/generated/es-ES';
import { messages as frMessages } from '@/locales/generated/fr-FR';

import { WEBSITE_LOCALE_LIST } from './website-locale-list';

const CATALOGS: Partial<Record<AppLocale, Messages>> = {
  en: enMessages,
  'es-ES': esMessages,
  'fr-FR': frMessages,
};

// Fail at module load if a locale was added to WEBSITE_LOCALE_LIST without
// importing its compiled catalog above — silent English fallbacks are bugs.
for (const locale of WEBSITE_LOCALE_LIST) {
  if (CATALOGS[locale] === undefined) {
    throw new Error(
      `Missing compiled catalog for website locale "${locale}". Run ` +
        `\`nx run twenty-website:lingui:compile\` and import ` +
        `@/locales/generated/${locale} in messages-by-locale.ts.`,
    );
  }
}

export const MESSAGES_BY_LOCALE: Partial<Record<AppLocale, Messages>> =
  CATALOGS;
