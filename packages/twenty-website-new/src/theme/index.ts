import { breakpoints } from './breakpoints';
import { colors } from './colors';
import { font } from './font';
import { layout } from './layout';
import { lineHeight } from './line-height';
import { radius } from './radius';
import { spacing } from './spacing';
import { zIndex } from './z-index';

export const theme = {
  colors,
  font,
  spacing,
  radius,
  lineHeight,
  breakpoints,
  layout,
  zIndex,
};

export type Theme = typeof theme;

export type Scheme = 'light' | 'muted' | 'dark';
