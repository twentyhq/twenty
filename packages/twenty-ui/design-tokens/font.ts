import { token } from './token';

export const FONT_TOKENS = {
  color: {
    primary: token({
      light: 'color(display-p3 0.2 0.2 0.2)',
      dark: 'color(display-p3 0.922 0.922 0.922)',
    }),
    secondary: token({
      light: 'color(display-p3 0.4 0.4 0.4)',
      dark: 'color(display-p3 0.702 0.702 0.702)',
    }),
    tertiary: token({
      light: 'color(display-p3 0.6 0.6 0.6)',
      dark: 'color(display-p3 0.506 0.506 0.506)',
    }),
    light: token({
      light: 'color(display-p3 0.702 0.702 0.702)',
      dark: 'color(display-p3 0.4 0.4 0.4)',
    }),
    extraLight: token({
      light: 'color(display-p3 0.8 0.8 0.8)',
      dark: 'color(display-p3 0.298 0.298 0.298)',
    }),
    inverted: token({
      light: 'color(display-p3 1 1 1)',
      dark: 'color(display-p3 0.09 0.09 0.09)',
    }),
    danger: token('color(display-p3 0.83 0.329 0.324)'),
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
