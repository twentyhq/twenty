import { createContext, useLayoutEffect, useState } from 'react';

import { themeCssVariables } from './themeCssVariables';

type DeepResolvedStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepResolvedStrings<T[K]>;
};

export type ThemeType = DeepResolvedStrings<typeof themeCssVariables>;

export type ThemeContextType = {
  theme: ThemeType;
  colorScheme: 'light' | 'dark';
};

const computeThemeFromCss = (): ThemeType => {
  const root = document?.documentElement;

  if (!root) {
    return themeCssVariables as unknown as ThemeType;
  }

  const computedStyle = getComputedStyle(root);

  const resolve = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (typeof value === 'string' && value.startsWith('var(')) {
        const varName = value.slice(4, -1);
        result[key] = computedStyle.getPropertyValue(varName).trim();
      } else if (typeof value === 'object' && value !== null) {
        result[key] = resolve(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return resolve(themeCssVariables as unknown as Record<string, unknown>) as unknown as ThemeType;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: themeCssVariables as unknown as ThemeType,
  colorScheme: 'light',
});

export const ThemeProvider = ({
  children,
  colorScheme,
}: {
  children: React.ReactNode;
  colorScheme: 'light' | 'dark';
}) => {
  const [theme, setTheme] = useState<ThemeType>(
    () => themeCssVariables as unknown as ThemeType,
  );

  useLayoutEffect(() => {
    const root = document?.documentElement;

    if (!root?.classList) return;

    root.classList.toggle('dark', colorScheme === 'dark');
    root.classList.toggle('light', colorScheme === 'light');

    setTheme(computeThemeFromCss());
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
