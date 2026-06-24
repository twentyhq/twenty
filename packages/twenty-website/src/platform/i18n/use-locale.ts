'use client';

import { useContext } from 'react';
import { type AppLocale } from 'twenty-shared/translations';

import { LocaleContext } from './locale-context';

export const useLocale = (): AppLocale => useContext(LocaleContext);
