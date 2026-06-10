import 'server-only';

import { type I18n } from '@lingui/core';
import { getI18n } from '@lingui/react/server';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { createI18nInstance } from './create-i18n-instance';

// Reads the request-scoped server i18n for descendant server components. The
// source-locale fallback is purely defensive — every route registers a
// context via getRouteI18n.
let fallbackI18n: I18n | null = null;

export const getServerI18n = (): I18n => {
  const instance = getI18n() as I18n | null;
  if (instance) return instance;
  fallbackI18n ??= createI18nInstance(SOURCE_LOCALE);
  return fallbackI18n;
};
