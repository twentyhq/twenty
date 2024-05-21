import { GRAY_SCALE } from '@ui/theme/constants/GrayScale';
import { MAIN_COLORS } from '@ui/theme/constants/MainColors';

export const SNACK_BAR = {
  color: {
    default: GRAY_SCALE.gray60,
    success: MAIN_COLORS.turquoise,
    error: MAIN_COLORS.red,
    warning: MAIN_COLORS.orange,
    info: MAIN_COLORS.blue,
  },
} as const;
