import type { I18n } from '@lingui/core';
import { getI18n } from '@lingui/react/server';

import { createI18nInstance } from './create-i18n-instance';

let fallback: I18n | null = null;

export function getServerI18n(): I18n {
  const instance = getI18n() as I18n | null;
  if (instance) return instance;
  if (!fallback) fallback = createI18nInstance('en');
  return fallback;
}
