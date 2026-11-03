import { isNonEmptyString, isObject, isString } from '@sniptt/guards';

import { themeCssVariables } from '../themeCssVariables';
import { type ThemeType } from '../themeTypes';
import { THEME_NUMERIC_VALUE_BY_CSS_VARIABLE } from './ThemeNumericValueByCssVariable';
import { type ThemeTokenTree } from './ThemeTokenTree';

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

export function resolveThemeTokens(
  readCssVariable?: (cssVariableName: string) => string,
): ThemeType;
export function resolveThemeTokens(
  readCssVariable?: (cssVariableName: string) => string,
): ThemeTokenTree {
  const resolve = (tokens: ThemeTokenTree): ThemeTokenTree => {
    const result: ThemeTokenTree = {};

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

      result[key] = isObject(value) ? resolve(value) : value;
    }

    return result;
  };

  return resolve(themeCssVariables);
}
