import { SPACING_VALUES } from '@ui/theme/utils/spacingValues';

const camelToKebab = (str: string): string =>
  str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const formatSpacingKey = (n: number): string => String(n).replace('.', '_');

const buildSpacingVariableRefs = (
  name: string,
): Record<string | number, string> => {
  const spacing: Record<string | number, string> = {};
  for (const n of SPACING_VALUES) {
    spacing[n] = `var(--${name}-${formatSpacingKey(n)})`;
  }
  return spacing;
};

const buildVariableRefForEntry = ({
  key,
  value,
  name,
}: {
  key: string;
  value: unknown;
  name: string;
}): unknown => {
  if (typeof value === 'function' && key === 'spacing') {
    return buildSpacingVariableRefs(name);
  }

  if (isPlainObject(value)) {
    return buildThemeReferencingRootCssVariables({
      themeNode: value,
      prefix: name,
    });
  }

  return `var(--${name})`;
};

// Builds a nested object that mirrors the theme shape, where every leaf
// is replaced with a CSS var(--t-…) reference string.
//   { font: { color: { primary: '#333' } } }
//   → { font: { color: { primary: 'var(--t-font-color-primary)' } } }
export const buildThemeReferencingRootCssVariables = ({
  themeNode,
  prefix,
}: {
  themeNode: Record<string, unknown>;
  prefix: string;
}): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(themeNode)) {
    const name = `${prefix}-${camelToKebab(key)}`;
    result[key] = buildVariableRefForEntry({ key, value, name });
  }

  return result;
};
