import { RGBA } from '@ui/theme/constants/Rgba';
import { BORDER_COMMON } from './BorderCommon';
import { COLOR } from './Colors';
import { GRAY_SCALE_DARK } from './GrayScaleDark';

export const BORDER_DARK = {
  color: {
    strong: GRAY_SCALE_DARK.gray7,
    medium: GRAY_SCALE_DARK.gray6,
    light: GRAY_SCALE_DARK.gray5,
    secondaryInverted: GRAY_SCALE_DARK.gray11,
    inverted: GRAY_SCALE_DARK.gray12,
    danger: COLOR.red70,
    blue: COLOR.blue30,
    transparentStrong: RGBA(GRAY_SCALE_DARK.gray1, 0.16),
  },
  ...BORDER_COMMON,
};
