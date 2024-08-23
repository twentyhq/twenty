import { MAIN_COLOR_NAMES, ThemeColor } from '@ui/theme';

export const getNextThemeColor = (currentColor?: ThemeColor): ThemeColor => {
  const currentColorIndex = currentColor
    ? MAIN_COLOR_NAMES.findIndex((color) => color === currentColor)
    : -1;
  const nextColorIndex = (currentColorIndex + 1) % MAIN_COLOR_NAMES.length;
  return MAIN_COLOR_NAMES[nextColorIndex];
};
