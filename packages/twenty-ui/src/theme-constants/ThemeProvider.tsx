import { createContext, useLayoutEffect, useState } from 'react';

import { ANIMATION } from '@ui/theme/constants/Animation';
import { ICON } from '@ui/theme/constants/Icon';
import { TEXT } from '@ui/theme/constants/Text';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
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

// Fallback theme with real numeric values for SSR / JSDOM environments
// where CSS variables are not available.
const fallbackTheme: ThemeType = {
  ...(themeCssVariables as unknown as ThemeType),
  icon: ICON as ThemeType['icon'],
  animation: ANIMATION as ThemeType['animation'],
  text: {
    ...(themeCssVariables.text as unknown as ThemeType['text']),
    lineHeight: TEXT.lineHeight as ThemeType['text']['lineHeight'],
    iconSizeMedium: TEXT.iconSizeMedium,
    iconSizeSmall: TEXT.iconSizeSmall,
    iconStrikeLight: TEXT.iconStrikeLight,
    iconStrikeMedium: TEXT.iconStrikeMedium,
    iconStrikeBold: TEXT.iconStrikeBold,
  },
  spacingMultiplicator: THEME_COMMON.spacingMultiplicator,
  lastLayerZIndex: THEME_COMMON.lastLayerZIndex,
};

const computeThemeFromCss = (): ThemeType => {
  const root = document?.documentElement;

  if (!root) {
    return fallbackTheme;
  }

  const computedStyle = getComputedStyle(root);

  const resolve = (
    cssVars: Record<string, unknown>,
    fallback: Record<string, unknown>,
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(cssVars)) {
      const value = cssVars[key];
      const fallbackValue = fallback[key];

      if (typeof value === 'string' && value.startsWith('var(')) {
        const varName = value.slice(4, -1);
        const raw = computedStyle.getPropertyValue(varName).trim();
        if (raw === '') {
          // CSS var not available (JSDOM / SSR) — use numeric fallback if available
          result[key] = fallbackValue ?? raw;
        } else {
          const num = Number(raw);
          result[key] = !isNaN(num) ? num : raw;
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = resolve(
          value as Record<string, unknown>,
          (fallbackValue as Record<string, unknown>) ?? {},
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return resolve(
    themeCssVariables as unknown as Record<string, unknown>,
    fallbackTheme as unknown as Record<string, unknown>,
  ) as unknown as ThemeType;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: fallbackTheme,
  colorScheme: 'light',
});

export const ThemeProvider = ({
  children,
  colorScheme,
}: {
  children: React.ReactNode;
  colorScheme: 'light' | 'dark';
}) => {
  const [theme, setTheme] = useState<ThemeType>(() => fallbackTheme);

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
