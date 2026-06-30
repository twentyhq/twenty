'use client';

import { useContext } from 'react';
import { type DocumentationSupportedLanguage } from 'twenty-shared/constants';

import { LocaleContext } from './locale-context';

export const useLocale = (): DocumentationSupportedLanguage =>
  useContext(LocaleContext);
