import { PALETTE, type PaletteToken } from './palette';

// WebGL uniforms take numeric colors; the palette stays the single source.
export function paletteColorNumber(token: PaletteToken): number {
  return Number.parseInt(PALETTE[token].slice(1), 16);
}
