import { type ColorToken } from './color-token';

// The single place a CSS variable name is formed: the generator emits with
// these and the accessors read with these, so the two sides cannot drift.
export const cssVariableName: {
  color: (token: ColorToken) => string;
  fontBase: string;
  radiusBase: string;
  spacingBase: string;
} = {
  color: (token) => `--color-${token}`,
  fontBase: '--font-base',
  radiusBase: '--radius-base',
  spacingBase: '--spacing-base',
};
