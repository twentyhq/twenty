import { BORDER_COMMON } from './BorderCommon';
import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';

export const BORDER_LIGHT = {
  color: {
    strong: GRAY_SCALE.gray25,
    medium: GRAY_SCALE.gray20,
    light: GRAY_SCALE.gray15,
    secondaryInverted: GRAY_SCALE.gray50,
    inverted: GRAY_SCALE.gray60,
    danger: COLOR.red20,
    blue: COLOR.blue30,
  },
  ...BORDER_COMMON,
};
