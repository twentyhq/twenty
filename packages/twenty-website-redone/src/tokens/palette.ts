export type PaletteToken =
  | 'white'
  | 'black'
  | 'black-hover'
  | 'white-hover'
  | 'graphite'
  | 'silver'
  | 'neutral'
  | 'blue'
  | 'pink'
  | 'green'
  | 'yellow'
  | 'ash'
  | 'fog';

// The illustration accents and artwork grays are the RATIFIED authored
// halftone palette (2026-06-11): dash colors of the WebGL artwork.
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
  pink: '#ed87fc',
  green: '#89fc9a',
  yellow: '#feffb7',
  // artwork grays: monolith dash / stepper stage dash
  ash: '#bababa',
  fog: '#dddddd',
};
