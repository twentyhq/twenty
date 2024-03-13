import { COLOR } from './Colors';
import { FONT_COMMON } from './FontCommon';
import { GRAY_SCALE } from './GrayScale';

export const FONT_LIGHT = {
  color: {
    primary: GRAY_SCALE.gray60,
    secondary: GRAY_SCALE.gray50,
    tertiary: GRAY_SCALE.gray40,
    light: GRAY_SCALE.gray35,
    extraLight: GRAY_SCALE.gray30,
    inverted: GRAY_SCALE.gray0,
    danger: COLOR.red,
  },
  ...FONT_COMMON,
};
