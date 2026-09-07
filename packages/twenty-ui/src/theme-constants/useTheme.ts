import { useContext } from 'react';

import { ThemeContext } from './ThemeProvider';
import { type ThemeType } from './themeTypes';

export const useTheme = (): ThemeType => useContext(ThemeContext).theme;
