import { BACKGROUND_DARK } from '@ui/theme/constants/BackgroundDark';
import { FONT_DARK } from '@ui/theme/constants/FontDark';
import { MAIN_COLORS_DARK } from '@ui/theme/constants/MainColorsDark';

export const SNACK_BAR_DARK = {
  success: {
    color: MAIN_COLORS_DARK.turquoise,
    backgroundColor: BACKGROUND_DARK.transparent.success,
  },
  error: {
    color: MAIN_COLORS_DARK.red,
    backgroundColor: BACKGROUND_DARK.transparent.danger,
  },
  warning: {
    color: MAIN_COLORS_DARK.orange,
    backgroundColor: BACKGROUND_DARK.transparent.orange,
  },
  info: {
    color: MAIN_COLORS_DARK.blue,
    backgroundColor: BACKGROUND_DARK.transparent.blue,
  },
  default: {
    color: FONT_DARK.color.primary,
    backgroundColor: BACKGROUND_DARK.transparent.light,
  },
};
