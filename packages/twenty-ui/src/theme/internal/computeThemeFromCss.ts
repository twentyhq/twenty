import { isNonEmptyString, isObject, isString } from '@sniptt/guards';

import { themeCssVariables } from '../themeCssVariables';
import { type ThemeType } from '../themeTypes';

const resolveTokenValue = ({
  cssVariableReference,
  computedValue,
}: {
  cssVariableReference: string;
  computedValue: string;
}): string | number => {
  if (!isNonEmptyString(computedValue)) {
    return cssVariableReference;
  }

  const numericValue = Number(computedValue);

  return Number.isNaN(numericValue) ? computedValue : numericValue;
};

export const computeThemeFromCss = (sourceElement?: HTMLElement): ThemeType => {
  if (
    typeof document === 'undefined' ||
    typeof getComputedStyle !== 'function'
  ) {
    return themeCssVariables as unknown as ThemeType;
  }

  const computedStyle = getComputedStyle(
    sourceElement ?? document.documentElement,
  );

  const resolve = (
    tokens: Record<string, unknown>,
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(tokens)) {
      if (isString(value) && value.startsWith('var(')) {
        const cssVariableName = value.slice(4, -1);

        result[key] = resolveTokenValue({
          cssVariableReference: value,
          computedValue: computedStyle.getPropertyValue(cssVariableName).trim(),
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
