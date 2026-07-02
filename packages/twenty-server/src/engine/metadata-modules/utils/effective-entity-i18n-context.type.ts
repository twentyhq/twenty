import { type I18n } from '@lingui/core';
import { type APP_LOCALES } from 'twenty-shared/translations';

export type EffectiveEntityI18nContext = {
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
  isStandardApp: boolean;
  applicationCatalog?: Record<string, string>;
};
