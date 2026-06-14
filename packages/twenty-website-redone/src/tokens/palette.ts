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
  | 'error'
  | 'ash'
  | 'fog'
  | 'charcoal'
  | 'stone'
  | 'iron';

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
  // form validation red, legible on the dark application surfaces.
  error: '#ff9a9a',
  // artwork grays: monolith dash / stepper stage dash / footer dash
  ash: '#bababa',
  fog: '#dddddd',
  charcoal: '#2a2a2a',
  // partner hero halftone dash
  stone: '#959595',
  // partner promo halftone dash
  iron: '#777777',
};
