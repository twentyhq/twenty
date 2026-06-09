import { COLOR_LIGHT } from '@ui/theme/constants/ColorsLight';
import { BORDER_COMMON } from './BorderCommon';
import { GRAY_SCALE_LIGHT } from './GrayScaleLight';
import { TRANSPARENT_COLORS_LIGHT } from './TransparentColorsLight';

export const BORDER_LIGHT = {
  color: {
    strong: GRAY_SCALE_LIGHT.gray6,
    medium: GRAY_SCALE_LIGHT.gray5,
    light: GRAY_SCALE_LIGHT.gray4,
    secondaryInverted: GRAY_SCALE_LIGHT.gray11,
    inverted: GRAY_SCALE_LIGHT.gray12,
    danger: COLOR_LIGHT.red5,
    blue: COLOR_LIGHT.blue7,
    transparentStrong: TRANSPARENT_COLORS_LIGHT.gray4,
  },
  ...BORDER_COMMON,
};
