import { token } from '../token';

export const RUBY_COLOR_TOKENS = {
  scale: {
    ruby1: token({
      light: 'color(display-p3 0.998 0.989 0.992)',
      dark: 'color(display-p3 0.093 0.068 0.074)',
    }),
    ruby2: token({
      light: 'color(display-p3 0.995 0.971 0.974)',
      dark: 'color(display-p3 0.113 0.083 0.089)',
    }),
    ruby3: token({
      light: 'color(display-p3 0.983 0.92 0.928)',
      dark: 'color(display-p3 0.208 0.088 0.117)',
    }),
    ruby4: token({
      light: 'color(display-p3 0.987 0.869 0.885)',
      dark: 'color(display-p3 0.279 0.092 0.147)',
    }),
    ruby5: token({
      light: 'color(display-p3 0.968 0.817 0.839)',
      dark: 'color(display-p3 0.337 0.12 0.18)',
    }),
    ruby6: token({
      light: 'color(display-p3 0.937 0.758 0.786)',
      dark: 'color(display-p3 0.401 0.166 0.223)',
    }),
    ruby7: token({
      light: 'color(display-p3 0.897 0.685 0.721)',
      dark: 'color(display-p3 0.495 0.224 0.281)',
    }),
    ruby8: token({
      light: 'color(display-p3 0.851 0.588 0.639)',
      dark: 'color(display-p3 0.652 0.295 0.359)',
    }),
    ruby9: token('color(display-p3 0.83 0.323 0.408)'),
    ruby10: token({
      light: 'color(display-p3 0.795 0.286 0.375)',
      dark: 'color(display-p3 0.857 0.392 0.455)',
    }),
    ruby11: token({
      light: 'color(display-p3 0.728 0.211 0.311)',
      dark: 'color(display-p3 1 0.57 0.59)',
    }),
    ruby12: token({
      light: 'color(display-p3 0.36 0.115 0.171)',
      dark: 'color(display-p3 0.968 0.83 0.88)',
    }),
  },
  transparent: {
    ruby1: token({ light: '#ff005503', dark: '#f4124a09' }),
    ruby2: token({ light: '#ff002008', dark: '#fe5a7f0e' }),
    ruby3: token({ light: '#f3002515', dark: '#ff235d2c' }),
    ruby4: token({ light: '#ff002523', dark: '#fd195e42' }),
    ruby5: token({ light: '#ff002a31', dark: '#fe2d6b53' }),
    ruby6: token({ light: '#e4002440', dark: '#ff447665' }),
    ruby7: token({ light: '#ce002553', dark: '#ff577d80' }),
    ruby8: token({ light: '#c300286d', dark: '#ff5c7cae' }),
    ruby9: token({ light: '#db002cb9', dark: '#fe4c70e4' }),
    ruby10: token({ light: '#d2002cc4', dark: '#ff617beb' }),
    ruby11: token({ light: '#c10030db', dark: '#ff949d' }),
    ruby12: token({ light: '#550016e8', dark: '#ffd3e2fe' }),
  },
};
