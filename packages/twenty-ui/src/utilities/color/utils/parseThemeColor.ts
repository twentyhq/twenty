import { DEFAULT_THEME_COLOR_FALLBACK, type ThemeColor } from '@ui/theme';

import { themeColorSchema } from './themeColorSchema';

export const parseThemeColor = (
  color: string | null | undefined,
): ThemeColor => {
  const result = themeColorSchema.safeParse(color ?? '');
  return result.success ? result.data : DEFAULT_THEME_COLOR_FALLBACK;
};
