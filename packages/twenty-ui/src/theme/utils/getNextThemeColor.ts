import { MAIN_COLOR_NAMES, type ThemeColor } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

export const getNextThemeColor = (currentColor?: ThemeColor): ThemeColor => {
  if (!isDefined(currentColor)) {
    return MAIN_COLOR_NAMES[0];
  }
  const currentColorIndex = MAIN_COLOR_NAMES.findIndex(
    (color) => color === currentColor,
  );
  const nextColorIndex = (currentColorIndex + 1) % MAIN_COLOR_NAMES.length;
  return MAIN_COLOR_NAMES[nextColorIndex];
};
