import { token } from '../token';

export const IRIS_COLOR_TOKENS = {
  scale: {
    iris1: token({
      light: 'color(display-p3 0.992 0.992 0.999)',
      dark: 'color(display-p3 0.075 0.075 0.114)',
    }),
    iris2: token({
      light: 'color(display-p3 0.972 0.973 0.998)',
      dark: 'color(display-p3 0.089 0.086 0.14)',
    }),
    iris3: token({
      light: 'color(display-p3 0.943 0.945 0.992)',
      dark: 'color(display-p3 0.128 0.134 0.272)',
    }),
    iris4: token({
      light: 'color(display-p3 0.902 0.906 1)',
      dark: 'color(display-p3 0.153 0.165 0.382)',
    }),
    iris5: token({
      light: 'color(display-p3 0.857 0.861 1)',
      dark: 'color(display-p3 0.192 0.201 0.44)',
    }),
    iris6: token({
      light: 'color(display-p3 0.799 0.805 0.987)',
      dark: 'color(display-p3 0.239 0.241 0.491)',
    }),
    iris7: token({
      light: 'color(display-p3 0.721 0.727 0.955)',
      dark: 'color(display-p3 0.291 0.289 0.565)',
    }),
    iris8: token({
      light: 'color(display-p3 0.61 0.619 0.918)',
      dark: 'color(display-p3 0.35 0.345 0.673)',
    }),
    iris9: token('color(display-p3 0.357 0.357 0.81)'),
    iris10: token({
      light: 'color(display-p3 0.318 0.318 0.774)',
      dark: 'color(display-p3 0.428 0.416 0.843)',
    }),
    iris11: token({
      light: 'color(display-p3 0.337 0.326 0.748)',
      dark: 'color(display-p3 0.685 0.662 1)',
    }),
    iris12: token({
      light: 'color(display-p3 0.154 0.161 0.371)',
      dark: 'color(display-p3 0.878 0.875 0.986)',
    }),
  },
  transparent: {
    iris1: token({ light: '#0000ff02', dark: '#3636fe0e' }),
    iris2: token({ light: '#0000ff07', dark: '#564bf916' }),
    iris3: token({ light: '#0011ee0f', dark: '#525bff3b' }),
    iris4: token({ light: '#000bff19', dark: '#4d58ff5a' }),
    iris5: token({ light: '#000eff25', dark: '#5b62fd6b' }),
    iris6: token({ light: '#000aff34', dark: '#6d6ffd7a' }),
    iris7: token({ light: '#0008e647', dark: '#7777fe8e' }),
    iris8: token({ light: '#0008d964', dark: '#7b7afeac' }),
    iris9: token({ light: '#0000c0a4', dark: '#6a6afed4' }),
    iris10: token({ light: '#0000b6ae', dark: '#7d79ffdc' }),
    iris11: token({ light: '#0600abac', dark: '#b1a9ff' }),
    iris12: token({ light: '#000246d8', dark: '#e1e0fffe' }),
  },
};
