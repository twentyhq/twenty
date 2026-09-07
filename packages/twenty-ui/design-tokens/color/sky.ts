import { token } from '../token';

export const SKY_COLOR_TOKENS = {
  scale: {
    sky1: token({
      light: 'color(display-p3 0.98 0.995 0.999)',
      dark: 'color(display-p3 0.056 0.078 0.116)',
    }),
    sky2: token({
      light: 'color(display-p3 0.953 0.98 0.99)',
      dark: 'color(display-p3 0.075 0.101 0.149)',
    }),
    sky3: token({
      light: 'color(display-p3 0.899 0.963 0.989)',
      dark: 'color(display-p3 0.089 0.154 0.244)',
    }),
    sky4: token({
      light: 'color(display-p3 0.842 0.937 0.977)',
      dark: 'color(display-p3 0.106 0.207 0.323)',
    }),
    sky5: token({
      light: 'color(display-p3 0.777 0.9 0.954)',
      dark: 'color(display-p3 0.135 0.261 0.394)',
    }),
    sky6: token({
      light: 'color(display-p3 0.701 0.851 0.921)',
      dark: 'color(display-p3 0.17 0.322 0.469)',
    }),
    sky7: token({
      light: 'color(display-p3 0.604 0.785 0.879)',
      dark: 'color(display-p3 0.205 0.394 0.557)',
    }),
    sky8: token({
      light: 'color(display-p3 0.457 0.696 0.829)',
      dark: 'color(display-p3 0.232 0.48 0.665)',
    }),
    sky9: token('color(display-p3 0.585 0.877 0.983)'),
    sky10: token({
      light: 'color(display-p3 0.555 0.845 0.959)',
      dark: 'color(display-p3 0.718 0.925 0.991)',
    }),
    sky11: token({
      light: 'color(display-p3 0.193 0.448 0.605)',
      dark: 'color(display-p3 0.536 0.772 0.924)',
    }),
    sky12: token({
      light: 'color(display-p3 0.145 0.241 0.329)',
      dark: 'color(display-p3 0.799 0.947 0.993)',
    }),
  },
  transparent: {
    sky1: token({ light: '#00d5ff06', dark: '#0044ff0f' }),
    sky2: token({ light: '#00a4db0e', dark: '#1171fb18' }),
    sky3: token({ light: '#00b3ee1e', dark: '#1184fc33' }),
    sky4: token({ light: '#00ace42e', dark: '#128fff49' }),
    sky5: token({ light: '#00a1d841', dark: '#1c9dfd5d' }),
    sky6: token({ light: '#0092ca56', dark: '#28a5ff72' }),
    sky7: token({ light: '#0089c172', dark: '#2badfe8b' }),
    sky8: token({ light: '#0085bf9f', dark: '#1db2fea9' }),
    sky9: token({ light: '#00c7fe83', dark: '#7ce3fffe' }),
    sky10: token({ light: '#00bcf38b', dark: '#a8eeff' }),
    sky11: token({ light: '#00749e', dark: '#7cd3ffef' }),
    sky12: token({ light: '#002540e2', dark: '#c2f3ff' }),
  },
};
