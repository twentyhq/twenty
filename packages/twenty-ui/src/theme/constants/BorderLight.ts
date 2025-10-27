import { RGBA } from '@ui/theme/constants/Rgba';
import { BORDER_COMMON } from './BorderCommon';
import { COLOR } from './Colors';
import { GRAY_SCALE_LIGHT } from './GrayScaleLight';

export const BORDER_LIGHT = {
  color: {
    strong: GRAY_SCALE_LIGHT.gray6,
    medium: GRAY_SCALE_LIGHT.gray5,
    light: GRAY_SCALE_LIGHT.gray4,
    secondaryInverted: GRAY_SCALE_LIGHT.gray11,
    inverted: GRAY_SCALE_LIGHT.gray12,
    danger: COLOR.red20,
    blue: COLOR.blue30,
    transparentStrong: RGBA(GRAY_SCALE_LIGHT.gray12, 0.16),
  },
  ...BORDER_COMMON,
};
