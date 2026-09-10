import { COLOR_TOKENS } from './color';
import { GRAY_SCALE_TOKENS } from './grayScale';
import { token } from './token';

const SM_RADIUS = token('4px');
const MD_RADIUS = token('8px');

export const BORDER_TOKENS = {
  color: {
    strong: GRAY_SCALE_TOKENS.gray6,
    medium: GRAY_SCALE_TOKENS.gray5,
    light: GRAY_SCALE_TOKENS.gray4,
    secondaryInverted: GRAY_SCALE_TOKENS.gray11,
    inverted: GRAY_SCALE_TOKENS.gray12,
    danger: COLOR_TOKENS.red5,
    blue: COLOR_TOKENS.blue7,
    transparentStrong: COLOR_TOKENS.transparent.gray4,
  },
  radius: {
    xs: token('2px'),
    sm: SM_RADIUS,
    md: MD_RADIUS,
    smRound: SM_RADIUS,
    mdRound: MD_RADIUS,
    lg: token('16px'),
    xl: token('20px'),
    xxl: token('40px'),
    pill: token('999px'),
    rounded: token('100%'),
  },
};
