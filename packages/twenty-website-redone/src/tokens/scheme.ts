import { type ColorToken } from './color-token';

export type Scheme = 'light' | 'muted' | 'dark';

// Surface schemes resolve the semantic colors (surface / ink / line) that
// components consume, so nothing scheme-specific ever appears at call sites.
export const SCHEMES: Record<
  Scheme,
  {
    surface: ColorToken;
    ink: ColorToken;
    inkMuted: ColorToken;
    line: ColorToken;
    lineStrong: ColorToken;
    divider: ColorToken;
  }
> = {
  light: {
    surface: 'white',
    ink: 'black',
    inkMuted: 'black-60',
    line: 'black-10',
    lineStrong: 'black-20',
    divider: 'black-40',
  },
  muted: {
    surface: 'neutral',
    ink: 'black',
    inkMuted: 'black-60',
    line: 'black-10',
    lineStrong: 'black-20',
    divider: 'black-40',
  },
  dark: {
    surface: 'black',
    ink: 'white',
    inkMuted: 'white-60',
    line: 'white-10',
    lineStrong: 'white-20',
    divider: 'white-40',
  },
};
