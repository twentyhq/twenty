import { createContext, useLayoutEffect, useMemo } from 'react';

import { type ThemeType } from '@ui/theme/types/ThemeType';
import { flattenThemeToVars } from '@ui/theme/utils/flattenThemeToVars';

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
  const cssVarEntries = useMemo(
    () => Object.entries(flattenThemeToVars(theme as Record<string, unknown>)),
    [theme],
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of cssVarEntries) {
      root.style.setProperty(name, value);
    }
    return () => {
      for (const [name] of cssVarEntries) {
        root.style.removeProperty(name);
      }
    };
  }, [cssVarEntries]);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};
