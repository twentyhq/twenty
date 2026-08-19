import { token } from './token';

export const BORDER_TOKENS = {
  color: {
    strong: token({
      light: 'color(display-p3 0.839 0.839 0.839)',
      dark: 'color(display-p3 0.282 0.282 0.282)',
    }),
    medium: token({
      light: 'color(display-p3 0.922 0.922 0.922)',
      dark: 'color(display-p3 0.133 0.133 0.133)',
    }),
    light: token({
      light: 'color(display-p3 0.945 0.945 0.945)',
      dark: 'color(display-p3 0.114 0.114 0.114)',
    }),
    secondaryInverted: token({
      light: 'color(display-p3 0.4 0.4 0.4)',
      dark: 'color(display-p3 0.702 0.702 0.702)',
    }),
    inverted: token({
      light: 'color(display-p3 0.2 0.2 0.2)',
      dark: 'color(display-p3 0.922 0.922 0.922)',
    }),
    danger: token({
      light: 'color(display-p3 0.984 0.812 0.811)',
      dark: 'color(display-p3 0.348 0.11 0.142)',
    }),
    blue: token({
      light: 'color(display-p3 0.685 0.74 0.957)',
      dark: 'color(display-p3 0.245 0.309 0.575)',
    }),
    transparentStrong: token({
      light: 'color(display-p3 0 0 0 / 0.071)',
      dark: 'color(display-p3 1 1 1 / 0.071)',
    }),
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
