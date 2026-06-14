'use client';

import { setupI18n, type Messages } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { type AppLocale } from 'twenty-shared/translations';

import { stripLocale } from './locales';

// Client-side i18n: the locale context, its provider, and the hooks that read
// it. The layout (a server component) loads the catalog and passes `messages`
// in as a prop, so this module never imports the catalogs itself.

const LocaleContext = createContext<AppLocale | null>(null);

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

export const useLocale = (): AppLocale => {
  const locale = useContext(LocaleContext);
  if (locale === null) {
    throw new Error(
      'useLocale must be used inside an I18nProvider (mounted by [locale]/layout.tsx)',
    );
  }
  return locale;
};

export const useUnlocalizedPathname = (): string => {
  const pathname = usePathname();
  return stripLocale(pathname ?? '');
};
