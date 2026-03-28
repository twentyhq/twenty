import { breakpoints } from './breakpoints';
import { colors } from './colors';
import { font } from './font';
import { lineHeight } from './line-height';
import { radius } from './radius';
import { spacing } from './spacing';

export const theme = { colors, font, spacing, radius, lineHeight, breakpoints };

export type Theme = typeof theme;
