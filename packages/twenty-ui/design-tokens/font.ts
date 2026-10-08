import { COLOR_TOKENS } from './color';
import { GRAY_SCALE_TOKENS } from './grayScale';
import { token } from './token';
export const FONT_TOKENS = {
  color: {
    primary: GRAY_SCALE_TOKENS.gray12,
    secondary: GRAY_SCALE_TOKENS.gray11,
    tertiary: GRAY_SCALE_TOKENS.gray9,
    light: GRAY_SCALE_TOKENS.gray8,
    extraLight: GRAY_SCALE_TOKENS.gray7,
    inverted: GRAY_SCALE_TOKENS.gray1,
    danger: COLOR_TOKENS.red,
  },
  size: {
    xxs: token('0.625rem'),
    xs: token('0.85rem'),
    sm: token('0.92rem'),
    md: token('1rem'),
    lg: token('1.23rem'),
    xl: token('1.54rem'),
    xxl: token('1.85rem'),
  },
  weight: {
    regular: token('400', { unit: 'number' }),
    medium: token('500', { unit: 'number' }),
    semiBold: token('600', { unit: 'number' }),
  },
  family: token('Inter, sans-serif'),
};
