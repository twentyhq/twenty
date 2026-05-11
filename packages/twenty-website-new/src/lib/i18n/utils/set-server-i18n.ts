import { setI18n } from '@lingui/react/server';
import type { AppLocale } from 'twenty-shared/translations';

import { createI18nInstance } from './create-i18n-instance';

export const setServerI18n = (locale: AppLocale) => {
  const i18n = createI18nInstance(locale);
  setI18n(i18n);
  return i18n;
};
