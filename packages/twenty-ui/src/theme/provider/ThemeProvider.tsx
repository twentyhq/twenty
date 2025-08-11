import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { type ReactNode } from 'react';

import { ThemeContextProvider } from '@ui/theme/provider/ThemeContextProvider';

import { type ThemeType } from '..';

type ThemeProviderProps = {
  theme: ThemeType;
  children: ReactNode;
};

const ThemeProvider = ({ theme, children }: ThemeProviderProps) => {
  return (
    <EmotionThemeProvider theme={theme}>
      <ThemeContextProvider theme={theme}>{children}</ThemeContextProvider>
    </EmotionThemeProvider>
  );
};

export default ThemeProvider;
