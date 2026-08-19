import { token } from './token';

export const CODE_TOKENS = {
  text: {
    gray: token({
      light: 'color(display-p3 0.514 0.514 0.514)',
      dark: 'color(display-p3 0.482 0.482 0.482)',
    }),
    sky: token({
      light: 'color(display-p3 0.555 0.845 0.959)',
      dark: 'color(display-p3 0.718 0.925 0.991)',
    }),
    pink: token({
      light: 'color(display-p3 0.748 0.27 0.581)',
      dark: 'color(display-p3 0.808 0.356 0.645)',
    }),
    orange: token({
      light: 'color(display-p3 0.877 0.597 0.379)',
      dark: 'color(display-p3 0.601 0.359 0.201)',
    }),
    green: token({
      light: 'color(display-p3 0.585 0.707 0.378)',
      dark: 'color(display-p3 0.365 0.456 0.25)',
    }),
  },
  font: {
    family: token('DM Mono'),
  },
};
