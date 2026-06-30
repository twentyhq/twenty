import { BACKGROUND_LIGHT } from '@ui/theme/constants/BackgroundLight';
import { FONT_LIGHT } from '@ui/theme/constants/FontLight';
import { MAIN_COLORS_LIGHT } from '@ui/theme/constants/MainColorsLight';

export const SNACK_BAR_LIGHT = {
  success: {
    color: MAIN_COLORS_LIGHT.turquoise,
    backgroundColor: BACKGROUND_LIGHT.transparent.success,
  },
  error: {
    color: MAIN_COLORS_LIGHT.red,
    backgroundColor: BACKGROUND_LIGHT.transparent.danger,
  },
  warning: {
    color: MAIN_COLORS_LIGHT.orange,
    backgroundColor: BACKGROUND_LIGHT.transparent.orange,
  },
  info: {
    color: MAIN_COLORS_LIGHT.blue,
    backgroundColor: BACKGROUND_LIGHT.transparent.blue,
  },
  default: {
    color: FONT_LIGHT.color.primary,
    backgroundColor: BACKGROUND_LIGHT.transparent.light,
  },
};
