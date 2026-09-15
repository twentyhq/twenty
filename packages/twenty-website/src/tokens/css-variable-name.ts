import { type ColorToken } from './color-token';

// The single place a CSS variable name is formed: the generator emits with
// these and the accessors read with these, so the two sides cannot drift.
export const cssVariableName: {
  color: (token: ColorToken) => string;
  divider: string;
  fontBase: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  line: string;
  lineStrong: string;
  radiusBase: string;
  spacingBase: string;
  surface: string;
} = {
  color: (token) => `--color-${token}`,
  divider: '--divider',
  fontBase: '--font-base',
  ink: '--ink',
  inkMuted: '--ink-muted',
  inkSubtle: '--ink-subtle',
  line: '--line',
  lineStrong: '--line-strong',
  radiusBase: '--radius-base',
  spacingBase: '--spacing-base',
  surface: '--surface',
};
