import { isString } from '@sniptt/guards';

import {
  DEFAULT_THEME_COLOR_FALLBACK,
  MAIN_COLOR_NAMES,
  type ThemeColor,
} from '@ui/theme';

export const parseThemeColor = (
  color: string | null | undefined,
): ThemeColor => {
  if (!isString(color)) {
    return DEFAULT_THEME_COLOR_FALLBACK;
  }

  return (
    MAIN_COLOR_NAMES.find((themeColor) => themeColor === color) ??
    DEFAULT_THEME_COLOR_FALLBACK
  );
};
