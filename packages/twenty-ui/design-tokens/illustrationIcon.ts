import { token } from './token';

export const ILLUSTRATION_ICON_TOKENS = {
  color: {
    blue: token({
      light: 'color(display-p3 0.569 0.639 0.916)',
      dark: 'color(display-p3 0.354 0.445 0.866)',
    }),
    gray: token({
      light: 'color(display-p3 0.6 0.6 0.6)',
      dark: 'color(display-p3 0.4 0.4 0.4)',
    }),
  },
  fill: {
    blue: token({
      light: 'color(display-p3 0.831 0.87 1)',
      dark: 'color(display-p3 0.848 0.881 0.99)',
    }),
    gray: token({
      light: 'color(display-p3 0.922 0.922 0.922)',
      dark: 'color(display-p3 0.133 0.133 0.133)',
    }),
  },
};
