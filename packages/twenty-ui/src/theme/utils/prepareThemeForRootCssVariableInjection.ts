import { camelToKebab, isPlainObject } from 'twenty-shared/utils';

import { SPACING_VALUES } from '@ui/theme/utils/spacingValues';

const formatSpacingKey = (n: number): string => String(n).replace('.', '_');

const collectSpacingEntries = (
  name: string,
  spacingFn: (...args: number[]) => string,
): [string, string][] =>
  SPACING_VALUES.map((n) => [`--${name}-${formatSpacingKey(n)}`, spacingFn(n)]);

const collectEntriesForValue = ({
  key,
  value,
  name,
}: {
  key: string;
  value: unknown;
  name: string;
}): [string, string][] => {
  if (typeof value === 'function' && key === 'spacing') {
    return collectSpacingEntries(name, value as (...args: number[]) => string);
  }

  if (isPlainObject(value)) {
    return prepareThemeForRootCssVariableInjection({
      themeNode: value,
      prefix: name,
    });
  }

  return [[`--${name}`, String(value)]];
};

// Collects a flat [--css-variable-name, value] list by walking a runtime
// theme object. Used to inject custom properties onto the DOM root.
//   { font: { color: { primary: '#333' } } }
//   → [['--t-font-color-primary', '#333']]
export const prepareThemeForRootCssVariableInjection = ({
  themeNode,
  prefix,
}: {
  themeNode: Record<string, unknown>;
  prefix: string;
}): [string, string][] =>
  Object.entries(themeNode).flatMap(([key, value]) => {
    const name = `${prefix}-${camelToKebab(key)}`;
    return collectEntriesForValue({ key, value, name });
  });
