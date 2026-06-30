import { useContext } from 'react';

import { ThemeContext, type ThemeType } from './ThemeProvider';

export const useTheme = (): ThemeType => useContext(ThemeContext).theme;
