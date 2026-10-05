import { type ThemeColor } from '@ui/theme/constants/MainColorNames';

export const getNextThemeColor = (
  colorNames: [ThemeColor, ...ThemeColor[]],
  currentColor?: ThemeColor,
): ThemeColor => {
  const [firstColor] = colorNames;
  if (currentColor === null || currentColor === undefined) {
    return firstColor;
  }
  const currentColorIndex = colorNames.findIndex(
    (color) => color === currentColor,
  );
  const nextColorIndex = (currentColorIndex + 1) % colorNames.length;
  return colorNames[nextColorIndex] ?? firstColor;
};
