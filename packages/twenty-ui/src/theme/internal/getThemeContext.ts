import React from 'react';

import { resolveThemeTokens } from './resolveThemeTokens';
import { type ThemeContextType } from './ThemeContextType';

let themeContext: React.Context<ThemeContextType> | undefined;

export const getThemeContext = () =>
  (themeContext ??= React.createContext<ThemeContextType>({
    theme: resolveThemeTokens(),
    colorScheme: 'light',
  }));
