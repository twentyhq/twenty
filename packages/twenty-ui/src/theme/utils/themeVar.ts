import { type ThemeType } from '@ui/theme/types/ThemeType';
import { THEME_LIGHT } from '@ui/theme/constants/ThemeLight';

import {
  camelToKebab,
  formatSpacingKey,
  SPACING_VALUES,
} from './themeConstants';

type DeepCSSVarRefs<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown
    ? Record<string | number, string>
    : T[K] extends Record<string, unknown>
      ? DeepCSSVarRefs<T[K]>
      : string;
};

const buildVarRefs = (
  obj: Record<string, unknown>,
  path: string,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const varPath = `${path}-${camelToKebab(key)}`;

    if (typeof value === 'function' && key === 'spacing') {
      const spacingObj: Record<string, string> = {};
      for (const n of SPACING_VALUES) {
        spacingObj[n] = `var(--${varPath}-${formatSpacingKey(n)})`;
      }
      result[key] = spacingObj;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = buildVarRefs(value as Record<string, unknown>, varPath);
    } else {
      result[key] = `var(--${varPath})`;
    }
  }

  return result;
};

// Pre-built plain object where every leaf is a CSS var() reference string.
// Built from the theme structure at module init time so wyw-in-js can
// evaluate and inline references at build time.
//
//   theme.font.color.primary  →  'var(--t-font-color-primary)'
//   theme.spacing[4]          →  'var(--t-spacing-4)'
//   theme.border.radius.sm    →  'var(--t-border-radius-sm)'
//
// The actual values are injected as CSS custom properties on the root
// element by ThemeContextProvider.
export const theme: DeepCSSVarRefs<ThemeType> = buildVarRefs(
  THEME_LIGHT as unknown as Record<string, unknown>,
  't',
) as DeepCSSVarRefs<ThemeType>;
