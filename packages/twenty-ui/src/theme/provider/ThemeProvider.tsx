import { ReactNode, useEffect } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';

import { ThemeContextProvider } from '@ui/theme/provider/ThemeContextProvider';

import { ThemeType } from '..';

import './theme.css';

type ThemeProviderProps = {
  theme: ThemeType;
  children: ReactNode;
};

const ThemeProvider = ({ theme, children }: ThemeProviderProps) => {
  useEffect(() => {
    document.documentElement.className =
      theme.name === 'dark' ? 'dark' : 'light';
  }, [theme]);

  return (
    <EmotionThemeProvider theme={theme}>
      <ThemeContextProvider theme={theme}>{children}</ThemeContextProvider>
    </EmotionThemeProvider>
  );
};

export default ThemeProvider;
