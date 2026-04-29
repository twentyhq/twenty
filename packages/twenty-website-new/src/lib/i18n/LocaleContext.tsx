'use client';

import { createContext } from 'react';
import { type AppLocale } from 'twenty-shared/translations';

export const LocaleContext = createContext<AppLocale | null>(null);
