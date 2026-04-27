'use client';

import { type I18n } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';

type I18nProviderProps = {
  i18n: I18n;
  children: ReactNode;
};

export const I18nProvider = ({ i18n, children }: I18nProviderProps) => (
  <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>
);
