export type PaletteToken =
  | 'white'
  | 'black'
  | 'black-hover'
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
  neutral: '#f4f4f4',
  blue: '#4a38f5',
  'blue-muted': '#8174f8',
  pink: '#ed87fc',
  'pink-muted': '#f3abfd',
  yellow: '#feffb7',
  'yellow-muted': '#feffd9',
  green: '#89fc9a',
  'green-muted': '#b0fdbe',
};
