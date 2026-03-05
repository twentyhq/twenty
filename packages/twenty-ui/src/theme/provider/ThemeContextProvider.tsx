import { createContext, useLayoutEffect } from 'react';

import { type ThemeType } from '@ui/theme/types/ThemeType';

export type ThemeContextType = {
  theme: ThemeType;
};

export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType,
);

export const ThemeContextProvider = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ThemeType;
}) => {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const isDark = theme.name === 'dark';
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
  }, [theme.name]);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};
