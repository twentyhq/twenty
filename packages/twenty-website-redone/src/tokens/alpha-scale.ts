export type AlphaScaleColor = 'black' | 'blue' | 'white';

export type AlphaStep = 80 | 70 | 60 | 40 | 20 | 10 | 5;

export type AlphaToken = `${AlphaScaleColor}-${AlphaStep}`;

export const ALPHA_SCALE: {
  colors: readonly AlphaScaleColor[];
  stepHex: Record<AlphaStep, string>;
} = {
  // blue (the accent) is alpha-able too: selected/hover/wash surfaces are the
  // accent at an alpha, the same way line/divider are black/white at an alpha.
  colors: ['black', 'blue', 'white'],
  // 70 exists for WCAG AA muted ink (60 misses 4.5:1 on light surfaces).
  stepHex: {
    80: 'cc',
    70: 'b3',
    60: '99',
    40: '66',
    20: '33',
    10: '1a',
    5: '0d',
  },
};
