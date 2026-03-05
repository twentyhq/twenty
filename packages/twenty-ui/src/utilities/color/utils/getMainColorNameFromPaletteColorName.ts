import { type ThemeColor } from '@ui/theme-constants';

export const getMainColorNameFromPaletteColorName = (
  paletteColorName: string,
): ThemeColor => {
  return paletteColorName.replace(/\d+$/, '') as ThemeColor;
};
