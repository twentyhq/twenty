export type PaletteToken =
  | 'white'
  | 'black'
  | 'black-hover'
  | 'black-sheen'
  | 'white-hover'
  | 'neutral-sheen'
  | 'neutral'
  | 'blue'
  | 'blue-muted'
  | 'pink'
  | 'pink-muted'
  | 'yellow'
  | 'yellow-muted'
  | 'green'
  | 'green-muted';

export const PALETTE: Record<PaletteToken, string> = {
  white: '#ffffff',
  black: '#1c1c1c',
  'black-hover': '#333333',
  // white at 5% composited over black: opaque, so the button shape's
  // anti-seam segment overlaps cannot double a translucent fill.
  'black-sheen': '#272727',
  // mirror of black-hover: white shifted 10% toward black.
  'white-hover': '#e8e8e8',
  neutral: '#f4f4f4',
  // black at 5% composited over the neutral surface (the white-surface
  // equivalent is exactly #f4f4f4 = neutral itself).
  'neutral-sheen': '#e9e9e9',
  blue: '#4a38f5',
  'blue-muted': '#8174f8',
  pink: '#ed87fc',
  'pink-muted': '#f3abfd',
  yellow: '#feffb7',
  'yellow-muted': '#feffd9',
  green: '#89fc9a',
  'green-muted': '#b0fdbe',
};
