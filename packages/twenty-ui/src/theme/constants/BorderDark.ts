import { BORDER_COMMON } from './BorderCommon';
import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';

export const BORDER_DARK = {
  color: {
    strong: GRAY_SCALE.gray55,
    medium: GRAY_SCALE.gray65,
    light: GRAY_SCALE.gray70,
    secondaryInverted: GRAY_SCALE.gray35,
    inverted: GRAY_SCALE.gray20,
    danger: COLOR.red70,
    blue: COLOR.blue30,
  },
  ...BORDER_COMMON,
};
