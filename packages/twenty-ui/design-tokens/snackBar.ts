import { token } from './token';

export const SNACK_BAR_TOKENS = {
  success: {
    color: token('color(display-p3 0.297 0.637 0.581)'),
    backgroundColor: token({ light: '#00a43319', dark: '#11ff992d' }),
  },
  error: {
    color: token('color(display-p3 0.83 0.329 0.324)'),
    backgroundColor: token({ light: '#f3000d14', dark: '#ff173f2d' }),
  },
  warning: {
    color: token('color(display-p3 0.9 0.45 0.2)'),
    backgroundColor: token({ light: '#ff9c0029', dark: '#ff590039' }),
  },
  info: {
    color: token('color(display-p3 0.276 0.384 0.837)'),
    backgroundColor: token({ light: '#0047f112', dark: '#3566ff57' }),
  },
  default: {
    color: token({
      light: 'color(display-p3 0.2 0.2 0.2)',
      dark: 'color(display-p3 0.922 0.922 0.922)',
    }),
    backgroundColor: token({
      light: 'color(display-p3 0 0 0 / 0.039)',
      dark: 'color(display-p3 1 1 1 / 0.059)',
    }),
  },
};
