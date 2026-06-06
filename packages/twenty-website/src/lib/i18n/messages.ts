import { type Messages } from '@lingui/core';
import { createI18nInstanceFactory } from 'twenty-shared/i18n';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { messages as enMessages } from '@/locales/generated/en';
import { messages as esMessages } from '@/locales/generated/es-ES';
import { messages as frMessages } from '@/locales/generated/fr-FR';

import { WEBSITE_LOCALE_LIST } from './locales';

// Compiled catalogs and the i18n-instance factory. Importing this module pulls
// in the (large) generated message catalogs, so it is server-side only — never
// import it from a client component (the client receives `messages` as a prop
// from the layout via the I18nProvider instead).
const MESSAGES_BY_LOCALE: Partial<Record<AppLocale, Messages>> = {
  en: enMessages,
  'es-ES': esMessages,
  'fr-FR': frMessages,
};

// Fail loudly at module load if a locale was added to WEBSITE_LOCALE_LIST
// without importing its compiled catalog here. Without this, a new locale
// would silently fall back to English and ship untranslated — a near-invisible
// SEO regression. Adding a locale stays three honest steps: append to
// WEBSITE_LOCALE_LIST, run lingui:compile, import its catalog above.
for (const locale of WEBSITE_LOCALE_LIST) {
  if (MESSAGES_BY_LOCALE[locale] === undefined) {
    throw new Error(
      `Missing compiled catalog for website locale "${locale}". ` +
        `Run \`nx run twenty-website:lingui:compile\` and import ` +
        `@/locales/generated/${locale} in src/lib/i18n/messages.ts.`,
    );
  }
}

export const getLocaleMessages = (locale: AppLocale): Messages =>
  MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE[SOURCE_LOCALE] ?? {};

export const createI18nInstance = createI18nInstanceFactory(MESSAGES_BY_LOCALE);
