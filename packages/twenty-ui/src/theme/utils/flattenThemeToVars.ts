const camelToKebab = (str: string): string =>
  str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);

type CSSVarMap = Record<string, string>;

// Common spacing values to pre-generate from the spacing() function
const SPACING_VALUES = [
  0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 30, 32,
];

const formatSpacingKey = (n: number): string => String(n).replace('.', '_');

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
