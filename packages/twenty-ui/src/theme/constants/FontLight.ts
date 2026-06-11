import { COLOR_LIGHT } from '@ui/theme/constants/ColorsLight';
import { FONT_COMMON } from './FontCommon';
import { GRAY_SCALE_LIGHT } from './GrayScaleLight';

export const FONT_LIGHT = {
  color: {
    primary: GRAY_SCALE_LIGHT.gray12,
    secondary: GRAY_SCALE_LIGHT.gray11,
    tertiary: GRAY_SCALE_LIGHT.gray9,
    light: GRAY_SCALE_LIGHT.gray8,
    extraLight: GRAY_SCALE_LIGHT.gray7,
    inverted: GRAY_SCALE_LIGHT.gray1,
    danger: COLOR_LIGHT.red,
  },
  ...FONT_COMMON,
};
