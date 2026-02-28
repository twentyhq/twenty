import {
  camelToKebab,
  formatSpacingKey,
  SPACING_VALUES,
} from './themeConstants';

type CSSVarMap = Record<string, string>;

export const flattenThemeToVars = (
  theme: Record<string, unknown>,
  prefix = 't',
): CSSVarMap => {
  const result: CSSVarMap = {};

  const flatten = (obj: Record<string, unknown>, path: string) => {
    for (const [key, value] of Object.entries(obj)) {
      const varName = `--${path}-${camelToKebab(key)}`;

      if (typeof value === 'string') {
        result[varName] = value;
      } else if (typeof value === 'number') {
        result[varName] = String(value);
      } else if (typeof value === 'function' && key === 'spacing') {
        for (const n of SPACING_VALUES) {
          const cssName = `${varName}-${formatSpacingKey(n)}`;
          result[cssName] = (value as (...args: number[]) => string)(n);
        }
      } else if (typeof value === 'object' && value !== null) {
        flatten(
          value as Record<string, unknown>,
          `${path}-${camelToKebab(key)}`,
        );
      }
    }
  };

  flatten(theme, prefix);
  return result;
};
