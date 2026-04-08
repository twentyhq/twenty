import { type ThemeColor } from '@ui/theme';
import { themeColorSchema } from '@ui/utilities';

import { DEFAULT_THEME_COLOR_FALLBACK } from '@ui/theme';

export const parseThemeColor = (
  color: string | null | undefined,
): ThemeColor => {
  const result = themeColorSchema.safeParse(color ?? '');
  return result.success ? result.data : DEFAULT_THEME_COLOR_FALLBACK;
};
