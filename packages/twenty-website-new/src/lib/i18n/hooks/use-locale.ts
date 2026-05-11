'use client';

import { useContext } from 'react';
import { type AppLocale } from 'twenty-shared/translations';

import { LocaleContext } from '../components/LocaleContext';

export const useLocale = (): AppLocale => {
  const locale = useContext(LocaleContext);
  if (locale === null) {
    throw new Error(
      'useLocale must be used inside a LocaleContext.Provider (mounted by [locale]/layout.tsx)',
    );
  }
  return locale;
};
