import { token } from '../token';

export const AMBER_COLOR_TOKENS = {
  scale: {
    amber1: token({
      light: 'color(display-p3 0.995 0.992 0.985)',
      dark: 'color(display-p3 0.082 0.07 0.05)',
    }),
    amber2: token({
      light: 'color(display-p3 0.994 0.986 0.921)',
      dark: 'color(display-p3 0.111 0.094 0.064)',
    }),
    amber3: token({
      light: 'color(display-p3 0.994 0.969 0.782)',
      dark: 'color(display-p3 0.178 0.128 0.049)',
    }),
    amber4: token({
      light: 'color(display-p3 0.989 0.937 0.65)',
      dark: 'color(display-p3 0.239 0.156 0)',
    }),
    amber5: token({
      light: 'color(display-p3 0.97 0.902 0.527)',
      dark: 'color(display-p3 0.29 0.193 0)',
    }),
    amber6: token({
      light: 'color(display-p3 0.936 0.844 0.506)',
      dark: 'color(display-p3 0.344 0.245 0.076)',
    }),
    amber7: token({
      light: 'color(display-p3 0.89 0.762 0.443)',
      dark: 'color(display-p3 0.422 0.314 0.141)',
    }),
    amber8: token({
      light: 'color(display-p3 0.85 0.65 0.3)',
      dark: 'color(display-p3 0.535 0.399 0.189)',
    }),
    amber9: token('color(display-p3 1 0.77 0.26)'),
    amber10: token({
      light: 'color(display-p3 0.959 0.741 0.274)',
      dark: 'color(display-p3 1 0.87 0.15)',
    }),
    amber11: token({
      light: 'color(display-p3 0.64 0.4 0)',
      dark: 'color(display-p3 1 0.8 0.29)',
    }),
    amber12: token({
      light: 'color(display-p3 0.294 0.208 0.145)',
      dark: 'color(display-p3 0.984 0.909 0.726)',
    }),
  },
  transparent: {
    amber1: token({ light: '#c0800004', dark: '#e63c0006' }),
    amber2: token({ light: '#f4d10016', dark: '#fd9b000d' }),
    amber3: token({ light: '#ffde003d', dark: '#fa820022' }),
    amber4: token({ light: '#ffd40063', dark: '#fc820032' }),
    amber5: token({ light: '#f8cf0088', dark: '#fd8b0041' }),
    amber6: token({ light: '#eab5008c', dark: '#fd9b0051' }),
    amber7: token({ light: '#dc9b009d', dark: '#ffab2567' }),
    amber8: token({ light: '#da8a00c9', dark: '#ffae3587' }),
    amber9: token({ light: '#ffb300c2', dark: '#ffc53d' }),
    amber10: token({ light: '#ffb300e7', dark: '#ffd60a' }),
    amber11: token({ light: '#ab6400', dark: '#ffca16' }),
    amber12: token({ light: '#341500dd', dark: '#ffe7b3' }),
  },
};
