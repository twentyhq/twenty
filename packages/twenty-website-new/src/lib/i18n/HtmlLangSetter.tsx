'use client';

import { useEffect } from 'react';
import { type AppLocale } from 'twenty-shared/translations';

type HtmlLangSetterProps = { locale: AppLocale };

export const HtmlLangSetter = ({ locale }: HtmlLangSetterProps) => {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
};
