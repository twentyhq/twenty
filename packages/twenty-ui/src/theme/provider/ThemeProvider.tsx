// ThemeProvider.tsx
import * as React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';

import { lightTheme } from '..';

type ThemeProviderProps = {
  theme: typeof lightTheme;
  children: React.ReactNode;
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
};

export default ThemeProvider;
