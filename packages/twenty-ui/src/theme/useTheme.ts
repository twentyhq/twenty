import React from 'react';

import { getThemeContext } from './internal/getThemeContext';
import { type ThemeType } from './themeTypes';

export const useTheme = (): ThemeType =>
  React.useContext(getThemeContext()).theme;
