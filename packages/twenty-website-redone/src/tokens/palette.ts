export type PaletteToken =
  | 'white'
  | 'black'
  | 'black-hover'
  | 'white-hover'
  | 'graphite'
  | 'silver'
  | 'neutral'
  | 'blue';

// Only colors with live consumers. The illustration accents (pink, yellow,
// green and their muted variants) return with the asset-constitution
// ratification — restore from git history when that lands.
export const PALETTE: Record<PaletteToken, string> = {
  white: '#ffffff',
  black: '#1c1c1c',
  'black-hover': '#333333',
  // mirror of black-hover: white shifted 10% toward black.
  'white-hover': '#e8e8e8',
  // the stepper visual frame's authored stage and border colors.
  graphite: '#424242',
  silver: '#dbdbdb',
  neutral: '#f4f4f4',
  blue: '#4a38f5',
};
