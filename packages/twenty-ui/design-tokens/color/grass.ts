import { token } from '../token';

export const GRASS_COLOR_TOKENS = {
  scale: {
    grass1: token({
      light: 'color(display-p3 0.986 0.996 0.985)',
      dark: 'color(display-p3 0.062 0.083 0.067)',
    }),
    grass2: token({
      light: 'color(display-p3 0.966 0.983 0.964)',
      dark: 'color(display-p3 0.083 0.103 0.085)',
    }),
    grass3: token({
      light: 'color(display-p3 0.923 0.965 0.917)',
      dark: 'color(display-p3 0.118 0.163 0.122)',
    }),
    grass4: token({
      light: 'color(display-p3 0.872 0.94 0.865)',
      dark: 'color(display-p3 0.142 0.225 0.15)',
    }),
    grass5: token({
      light: 'color(display-p3 0.811 0.908 0.802)',
      dark: 'color(display-p3 0.178 0.279 0.186)',
    }),
    grass6: token({
      light: 'color(display-p3 0.733 0.864 0.724)',
      dark: 'color(display-p3 0.217 0.337 0.224)',
    }),
    grass7: token({
      light: 'color(display-p3 0.628 0.803 0.622)',
      dark: 'color(display-p3 0.258 0.4 0.264)',
    }),
    grass8: token({
      light: 'color(display-p3 0.477 0.72 0.482)',
      dark: 'color(display-p3 0.302 0.47 0.305)',
    }),
    grass9: token('color(display-p3 0.38 0.647 0.378)'),
    grass10: token({
      light: 'color(display-p3 0.344 0.598 0.342)',
      dark: 'color(display-p3 0.426 0.694 0.426)',
    }),
    grass11: token({
      light: 'color(display-p3 0.263 0.488 0.261)',
      dark: 'color(display-p3 0.535 0.807 0.542)',
    }),
    grass12: token({
      light: 'color(display-p3 0.151 0.233 0.153)',
      dark: 'color(display-p3 0.797 0.936 0.776)',
    }),
  },
  transparent: {
    grass1: token({ light: '#00c00004', dark: '#00de1205' }),
    grass2: token({ light: '#0099000a', dark: '#5ef7780a' }),
    grass3: token({ light: '#00970016', dark: '#70fe8c1b' }),
    grass4: token({ light: '#009f0725', dark: '#57ff802c' }),
    grass5: token({ light: '#00930536', dark: '#68ff8b3b' }),
    grass6: token({ light: '#008f0a4d', dark: '#71ff8f4b' }),
    grass7: token({ light: '#018b0f6b', dark: '#77fd925d' }),
    grass8: token({ light: '#008d199a', dark: '#77fd9070' }),
    grass9: token({ light: '#008619b9', dark: '#65ff82a1' }),
    grass10: token({ light: '#007b17c1', dark: '#72ff8dae' }),
    grass11: token({ light: '#006514d5', dark: '#89ff9fcd' }),
    grass12: token({ light: '#002006df', dark: '#ceffceef' }),
  },
};
