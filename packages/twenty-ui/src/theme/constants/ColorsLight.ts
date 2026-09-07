import { MAIN_COLORS_LIGHT } from './MainColorsLight';
import { SECONDARY_COLORS_LIGHT } from './SecondaryColorsLight';
import { STATIC_COLORS } from './StaticColors';
import { TRANSPARENT_COLORS_LIGHT } from './TransparentColorsLight';

export const COLOR_LIGHT = {
  ...MAIN_COLORS_LIGHT,
  ...SECONDARY_COLORS_LIGHT,
  transparent: TRANSPARENT_COLORS_LIGHT,
  static: STATIC_COLORS,
};
