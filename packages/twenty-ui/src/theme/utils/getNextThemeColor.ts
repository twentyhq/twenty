import { MAIN_COLOR_NAMES, ThemeColor } from '@ui/theme';
import { isDefined } from '@ui/utilities';

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
