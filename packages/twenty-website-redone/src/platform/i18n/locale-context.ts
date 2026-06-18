'use client';

import { createContext } from 'react';
import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

export const LocaleContext = createContext<AppLocale>(SOURCE_LOCALE);
