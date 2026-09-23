import { COLOR_TOKENS } from './color';
import { GRAY_SCALE_TOKENS } from './grayScale';
import { token } from './token';
export const CODE_TOKENS = {
  text: {
    gray: GRAY_SCALE_TOKENS.gray10,
    sky: COLOR_TOKENS.sky10,
    pink: COLOR_TOKENS.pink10,
    orange: COLOR_TOKENS.orange8,
    green: COLOR_TOKENS.lime8,
  },
  font: {
    family: token('DM Mono'),
  },
};
