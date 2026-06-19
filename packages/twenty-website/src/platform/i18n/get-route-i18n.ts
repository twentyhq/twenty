import 'server-only';

import { type I18n } from '@lingui/core';
import { setI18n } from '@lingui/react/server';

import { createI18nInstance } from './create-i18n-instance';
import { resolveLocaleParam } from './resolve-locale-param';

export type LocaleRouteParams = { locale: string };

// The single entry every [locale] route calls: resolves the param, registers
// the request-scoped server i18n (so descendant server components resolve the
// right locale), and returns the instance for direct i18n._ use.
export const getRouteI18n = async (
  params: Promise<LocaleRouteParams>,
): Promise<I18n> => {
  const i18n = createI18nInstance(resolveLocaleParam((await params).locale));
  setI18n(i18n);
  return i18n;
};
