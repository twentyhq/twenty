import { COLOR_TOKENS } from './color';
import { GRAY_SCALE_TOKENS } from './grayScale';
import { token } from './token';
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
    sm: token('4px'),
    md: token('8px'),
    smRound: token('4px'),
    mdRound: token('8px'),
    lg: token('16px'),
    xl: token('20px'),
    xxl: token('40px'),
    pill: token('999px'),
    rounded: token('100%'),
  },
};
