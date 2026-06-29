'use client';

import { setupI18n, type Messages } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { useMemo, type ReactNode } from 'react';
import { type DocumentationSupportedLanguage } from 'twenty-shared/constants';

import { LocaleContext } from './locale-context';

export type I18nProviderProps = {
  children: ReactNode;
  locale: DocumentationSupportedLanguage;
  messages: Messages;
};

export function I18nProvider({
  children,
  locale,
  messages,
}: I18nProviderProps) {
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
}
