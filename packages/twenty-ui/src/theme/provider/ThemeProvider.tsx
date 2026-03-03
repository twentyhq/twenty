import { type ReactNode } from 'react';

import { ThemeContextProvider } from '@ui/theme/provider/ThemeContextProvider';

import { type ThemeType } from '..';

type ThemeProviderProps = {
  theme: ThemeType;
  children: ReactNode;
};

export const ThemeProvider = ({ theme, children }: ThemeProviderProps) => {
  return <ThemeContextProvider theme={theme}>{children}</ThemeContextProvider>;
};
