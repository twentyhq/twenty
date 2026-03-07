import { createContext, useLayoutEffect, useState } from 'react';

import { themeCssVariables } from './themeCssVariables';

type StringLeaves<T> = {
  [K in keyof T]: T[K] extends string ? string : StringLeaves<T[K]>;
};

type DeepMerge<T, U> = {
  [K in keyof T]: K extends keyof U
    ? U[K] extends Record<string, unknown>
      ? T[K] extends Record<string, unknown>
        ? DeepMerge<T[K], U[K]>
        : U[K]
      : U[K]
    : T[K];
};

// CSS variables that resolve to pure numbers at runtime
type NumericOverrides = {
  icon: {
    size: { sm: number; md: number; lg: number; xl: number };
    stroke: { sm: number; md: number; lg: number };
  };
  animation: {
    duration: { instant: number; fast: number; normal: number; slow: number };
  };
  text: {
    lineHeight: { lg: number; md: number };
    iconSizeMedium: number;
    iconSizeSmall: number;
    iconStrikeLight: number;
    iconStrikeMedium: number;
    iconStrikeBold: number;
  };
  spacingMultiplicator: number;
  lastLayerZIndex: number;
};

export type ThemeType = DeepMerge<
  StringLeaves<typeof themeCssVariables>,
  NumericOverrides
>;

export type ThemeContextType = {
  theme: ThemeType;
  colorScheme: 'light' | 'dark';
};

const computeThemeFromCss = (): ThemeType => {
  const root = document?.documentElement;

  if (!root || typeof getComputedStyle !== 'function') {
    return themeCssVariables as unknown as ThemeType;
  }

  const computedStyle = getComputedStyle(root);

  const resolve = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (typeof value === 'string' && value.startsWith('var(')) {
        const varName = value.slice(4, -1);
        const raw = computedStyle.getPropertyValue(varName).trim();
        const num = Number(raw);
        result[key] = raw !== '' && !isNaN(num) ? num : raw;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = resolve(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return resolve(
    themeCssVariables as unknown as Record<string, unknown>,
  ) as unknown as ThemeType;
};

const applyColorSchemeClass = (colorScheme: 'light' | 'dark') => {
  const root = document?.documentElement;
  if (!root?.classList) return;
  root.classList.toggle('dark', colorScheme === 'dark');
  root.classList.toggle('light', colorScheme === 'light');
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
  const [theme, setTheme] = useState<ThemeType>(() => {
    applyColorSchemeClass(colorScheme);
    return computeThemeFromCss();
  });

  useLayoutEffect(() => {
    applyColorSchemeClass(colorScheme);
    setTheme(computeThemeFromCss());
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
