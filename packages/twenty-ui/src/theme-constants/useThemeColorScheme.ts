import { useContext } from 'react';

import { ThemeContext } from './ThemeProvider';

export const useThemeColorScheme = (): 'light' | 'dark' =>
  useContext(ThemeContext).colorScheme;
