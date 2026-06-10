export type AlphaScaleColor = 'black' | 'white';

export type AlphaStep = 80 | 60 | 40 | 20 | 10 | 5;

export type AlphaToken = `${AlphaScaleColor}-${AlphaStep}`;

export const ALPHA_SCALE: {
  colors: readonly AlphaScaleColor[];
  stepHex: Record<AlphaStep, string>;
} = {
  colors: ['black', 'white'],
  stepHex: { 80: 'cc', 60: '99', 40: '66', 20: '33', 10: '1a', 5: '0d' },
};
