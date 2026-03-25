import { type ThemeColor } from '@ui/theme/constants/MainColorNames';

export const getNextThemeColor = (
  colorNames: ThemeColor[],
  currentColor?: ThemeColor,
): ThemeColor => {
  if (currentColor === null || currentColor === undefined) {
    return colorNames[0];
  }
  const currentColorIndex = colorNames.findIndex(
    (color) => color === currentColor,
  );
  const nextColorIndex = (currentColorIndex + 1) % colorNames.length;
  return colorNames[nextColorIndex];
};
