import { type ThemeColor } from '@ui/theme/constants/MainColorNames';
import { isDefined } from 'twenty-shared/utils';

export const getNextThemeColor = (
  colorNames: ThemeColor[],
  currentColor?: ThemeColor,
): ThemeColor => {
  if (!isDefined(currentColor)) {
    return colorNames[0];
  }
  const currentColorIndex = colorNames.findIndex(
    (color) => color === currentColor,
  );
  const nextColorIndex = (currentColorIndex + 1) % colorNames.length;
  return colorNames[nextColorIndex];
};
