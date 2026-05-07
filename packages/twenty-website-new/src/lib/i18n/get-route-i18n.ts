import type { AppLocale } from 'twenty-shared/translations';

import { createI18nInstance } from './create-i18n-instance';
import { resolveLocaleParam } from './resolve-locale-param';

export type LocaleRouteParams = {
  locale: string;
};

export const getRouteI18n = async (
  params: Promise<LocaleRouteParams>,
): Promise<ReturnType<typeof createI18nInstance>> => {
  const { locale: rawLocale } = await params;
  const locale: AppLocale = resolveLocaleParam(rawLocale);

  return createI18nInstance(locale);
};
