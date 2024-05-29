import { BACKGROUND_LIGHT } from '@ui/theme/constants/BackgroundLight';
import { FONT_LIGHT } from '@ui/theme/constants/FontLight';
import { SNACK_BAR_COMMON } from '@ui/theme/constants/SnackBarCommon';

export const SNACK_BAR_LIGHT = {
  ...SNACK_BAR_COMMON,
  default: {
    color: FONT_LIGHT.color.primary,
    backgroundColor: BACKGROUND_LIGHT.transparent.light,
  },
};
