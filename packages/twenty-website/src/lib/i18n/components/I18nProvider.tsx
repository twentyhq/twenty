'use client';

import { setupI18n, type Messages } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { useMemo, type ReactNode } from 'react';
import { type AppLocale } from 'twenty-shared/translations';

import { LocaleContext } from './LocaleContext';

type I18nProviderProps = {
  locale: AppLocale;
  messages: Messages;
  children: ReactNode;
};

export const I18nProvider = ({
  locale,
  messages,
  children,
}: I18nProviderProps) => {
  const i18n = useMemo(() => {
    const instance = setupI18n();
    instance.load(locale, messages);
    instance.activate(locale);
    return instance;
  }, [locale, messages]);

  return (
    <LocaleContext.Provider value={locale}>
      <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>
    </LocaleContext.Provider>
  );
};
