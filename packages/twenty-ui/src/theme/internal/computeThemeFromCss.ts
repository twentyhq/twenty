import { type ThemeType } from '../themeTypes';
import { resolveThemeTokens } from './resolveThemeTokens';

export const computeThemeFromCss = (sourceElement?: HTMLElement): ThemeType => {
  if (
    typeof document === 'undefined' ||
    typeof getComputedStyle !== 'function'
  ) {
    return resolveThemeTokens();
  }

  const computedStyle = getComputedStyle(
    sourceElement ?? document.documentElement,
  );

  return resolveThemeTokens((cssVariableName) =>
    computedStyle.getPropertyValue(cssVariableName).trim(),
  );
};
