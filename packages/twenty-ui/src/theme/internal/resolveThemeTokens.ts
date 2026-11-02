import { isNonEmptyString, isObject, isString } from '@sniptt/guards';

import { themeCssVariables } from '../themeCssVariables';
import { type ThemeType } from '../themeTypes';
import { THEME_NUMERIC_VALUE_BY_CSS_VARIABLE } from './ThemeNumericValueByCssVariable';

const resolveTokenValue = ({
  cssVariableName,
  cssVariableReference,
  computedValue,
}: {
  cssVariableName: string;
  cssVariableReference: string;
  computedValue: string;
}): string | number => {
  if (!isNonEmptyString(computedValue)) {
    return (
      THEME_NUMERIC_VALUE_BY_CSS_VARIABLE[cssVariableName] ??
      cssVariableReference
    );
  }

  const numericValue = Number(computedValue);

  return Number.isNaN(numericValue) ? computedValue : numericValue;
};

export const resolveThemeTokens = (
  readCssVariable?: (cssVariableName: string) => string,
): ThemeType => {
  const resolve = (
    tokens: Record<string, unknown>,
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(tokens)) {
      if (isString(value) && value.startsWith('var(')) {
        const cssVariableName = value.slice(4, -1);

        result[key] = resolveTokenValue({
          cssVariableName,
          cssVariableReference: value,
          computedValue: readCssVariable?.(cssVariableName) ?? '',
        });
        continue;
      }

      result[key] = isObject(value)
        ? resolve(value as Record<string, unknown>)
        : value;
    }

    return result;
  };

  return resolve(
    themeCssVariables as unknown as Record<string, unknown>,
  ) as unknown as ThemeType;
};
