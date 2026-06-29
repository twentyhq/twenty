'use client';

import { createContext } from 'react';
import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  type DocumentationSupportedLanguage,
} from 'twenty-shared/constants';

export const LocaleContext = createContext<DocumentationSupportedLanguage>(
  DOCUMENTATION_DEFAULT_LANGUAGE,
);
