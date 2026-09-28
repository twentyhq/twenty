import React from 'react';

import { themeCssVariables } from '../themeCssVariables';
import { type ThemeType } from '../themeTypes';
import { type ThemeContextType } from './ThemeContextType';

let themeContext: React.Context<ThemeContextType> | undefined;

export const getThemeContext = () =>
  (themeContext ??= React.createContext<ThemeContextType>({
    theme: themeCssVariables as unknown as ThemeType,
    colorScheme: 'light',
  }));
