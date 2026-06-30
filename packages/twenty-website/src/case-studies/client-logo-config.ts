// The customer wordmarks shown on each case-study card. The old site shipped
// five near-identical SVG files; here they are one config-driven component
// (client-logo.tsx) plus the dotted Nine Dots mark. viewBox height is always
// 22 for wordmarks; the dots mark is a fixed 56x56 grid.
export type ClientLogoKey =
  | 'nine-dots'
  | 'alternative-partners'
  | 'netzero'
  | 'act-education'
  | 'w3villa'
  | 'elevate-consulting';

type ClientWordmark = {
  kind: 'wordmark';
  text: string;
  viewBoxWidth: number;
  fontSizePx: number;
  letterSpacing: string;
};

type ClientDotsMark = { kind: 'dots' };

export type ClientLogoDefinition = ClientWordmark | ClientDotsMark;

export const CLIENT_LOGOS: Record<ClientLogoKey, ClientLogoDefinition> = {
  'nine-dots': { kind: 'dots' },
  'alternative-partners': {
    kind: 'wordmark',
    text: 'Alternative',
    viewBoxWidth: 132,
    fontSizePx: 13,
    letterSpacing: '-0.02em',
  },
  netzero: {
    kind: 'wordmark',
    text: 'NetZero',
    viewBoxWidth: 100,
    fontSizePx: 15,
    letterSpacing: '-0.02em',
  },
  'act-education': {
    kind: 'wordmark',
    text: 'AC&T',
    viewBoxWidth: 52,
    fontSizePx: 15,
    letterSpacing: '-0.04em',
  },
  w3villa: {
    kind: 'wordmark',
    text: 'W3villa',
    viewBoxWidth: 76,
    fontSizePx: 15,
    letterSpacing: '-0.02em',
  },
  'elevate-consulting': {
    kind: 'wordmark',
    text: 'Elevate',
    viewBoxWidth: 88,
    fontSizePx: 16,
    letterSpacing: '-0.03em',
  },
};
