import { COLOR_TOKENS } from './color';
import { GRAY_SCALE_TOKENS } from './grayScale';
import { token } from './token';
export const SNACK_BAR_TOKENS = {
  success: {
    color: COLOR_TOKENS.turquoise,
    backgroundColor: token({ light: '#00a43319', dark: '#11ff992d' }),
  },
  error: {
    color: COLOR_TOKENS.red,
    backgroundColor: COLOR_TOKENS.transparent.red3,
  },
  warning: {
    color: COLOR_TOKENS.orange,
    backgroundColor: token({ light: '#ff9c0029', dark: '#ff590039' }),
  },
  info: {
    color: COLOR_TOKENS.blue,
    backgroundColor: token({ light: '#0047f112', dark: '#3566ff57' }),
  },
  default: {
    color: GRAY_SCALE_TOKENS.gray12,
    backgroundColor: COLOR_TOKENS.transparent.gray2,
  },
};
