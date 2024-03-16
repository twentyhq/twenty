// ThemeProvider.tsx
import * as React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';

import { ThemeType } from '..';

type ThemeProviderProps = {
  theme: ThemeType;
  children: React.ReactNode;
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
};

export default ThemeProvider;
