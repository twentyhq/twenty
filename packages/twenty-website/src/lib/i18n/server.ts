import 'server-only';

import type { I18n } from '@lingui/core';
import { getI18n, setI18n } from '@lingui/react/server';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { resolveLocaleParam } from './locales';
import { createI18nInstance } from './messages';

// Server-side i18n: the request-scoped Lingui context plus the catalog-runtime
// re-exports. This module is `server-only`; importing it from a client bundle
// is a build error by design.
export { createI18nInstance, getLocaleMessages } from './messages';

export type LocaleRouteParams = { locale: string };

// Creates the i18n instance for `locale` and registers it as the request-scoped
// server context (Lingui setI18n, backed by React cache). Returns the instance.
export const setServerI18n = (locale: AppLocale): I18n => {
  const i18n = createI18nInstance(locale);
  setI18n(i18n);
  return i18n;
};

// The single entry every [locale] route calls. Resolves the param, registers
// the request i18n (so descendant server components reading getServerI18n
// resolve the right locale even though App Router may render layout and page in
// parallel), and returns the instance for direct i18n._ use.
export const getRouteI18n = async (
  params: Promise<LocaleRouteParams>,
): Promise<I18n> => {
  const { locale } = await params;
  return setServerI18n(resolveLocaleParam(locale));
};

// Reads the request-scoped server i18n for descendant server components. Falls
// back to a source-locale instance only if no context was registered — every
// route registers one via getRouteI18n, so the fallback is purely defensive.
let fallbackI18n: I18n | null = null;

export const getServerI18n = (): I18n => {
  const instance = getI18n() as I18n | null;
  if (instance) return instance;
  fallbackI18n ??= createI18nInstance(SOURCE_LOCALE);
  return fallbackI18n;
};
