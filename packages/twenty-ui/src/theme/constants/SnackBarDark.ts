import { BACKGROUND_DARK } from '@ui/theme/constants/BackgroundDark';
import { FONT_DARK } from '@ui/theme/constants/FontDark';
import { SNACK_BAR_COMMON } from '@ui/theme/constants/SnackBarCommon';

export const SNACK_BAR_DARK = {
  ...SNACK_BAR_COMMON,
  default: {
    color: FONT_DARK.color.primary,
    backgroundColor: BACKGROUND_DARK.transparent.light,
  },
};
