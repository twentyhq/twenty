import { createContext } from 'react';

import { type ThemeType } from '@ui/theme/types/ThemeType';
import { ThemeCssVariableInjectorEffect } from '@ui/theme/provider/ThemeCssVariableInjectorEffect';

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
  return (
    <ThemeContext.Provider value={{ theme }}>
      <ThemeCssVariableInjectorEffect theme={theme} />
      {children}
    </ThemeContext.Provider>
  );
};
