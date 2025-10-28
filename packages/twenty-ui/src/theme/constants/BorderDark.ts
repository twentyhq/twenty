import { COLOR_DARK } from '@ui/theme/constants/ColorsDark';
import { RGBA } from '@ui/theme/constants/Rgba';
import { BORDER_COMMON } from './BorderCommon';
import { GRAY_SCALE_DARK } from './GrayScaleDark';

export const BORDER_DARK = {
  color: {
    strong: GRAY_SCALE_DARK.gray7,
    medium: GRAY_SCALE_DARK.gray6,
    light: GRAY_SCALE_DARK.gray5,
    secondaryInverted: GRAY_SCALE_DARK.gray11,
    inverted: GRAY_SCALE_DARK.gray12,
    danger: COLOR_DARK.red5,
    blue: COLOR_DARK.blue7,
    transparentStrong: RGBA(GRAY_SCALE_DARK.gray1, 0.16),
  },
  ...BORDER_COMMON,
};
