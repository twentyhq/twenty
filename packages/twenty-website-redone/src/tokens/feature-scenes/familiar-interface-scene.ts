import { fontFamily } from '../font-family';

type TonePair = { background: string; color: string };

// Token marks reuse the old shared tone table (hand-mixed pairs).
const TOKEN_TONES: Record<string, TonePair> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
  yellow: { background: '#fef2a4', color: '#35290f' },
};

// The familiar-interface feature scene's authored inks and motion,
// ported verbatim from the old ThreeCards visual styles. Geometry (the
// Figma-fractional dimensions) stays with the scene's styles.
export const FAMILIAR_INTERFACE_SCENE = {
  colors: {
    backdrop: '#1b1b1b',
    border: '#ebebeb',
    borderLight: '#f1f1f1',
    borderStrong: '#d6d6d6',
    boardSurface: '#ffffff',
    boardRing: '0 0 0 1px rgba(255, 255, 255, 0.6)',
    cardSurface: '#fcfcfc',
    cardShadow:
      '0px 0px 3.677px rgba(0, 0, 0, 0.08), 0px 1.839px 3.677px rgba(0, 0, 0, 0.04)',
    activeCardBorder: '#b5ccff',
    activeCardSurface: '#e8f1ff',
    imageAreaSurface: '#f5f5f3',
    laneCount: '#999999',
    laneLabelPink: '#d6409f',
    laneLabelPinkSurface: '#fce5f3',
    laneLabelPurple: '#8e4ec6',
    laneLabelPurpleSurface: '#ede9fe',
    textLight: '#b3b3b3',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    checkboxStroke: '#C2C2C2',
    ratingEmptyStar: '#d6d6d6',
    softWash: 'rgba(0, 0, 0, 0.04)',
  },
  tokenTones: TOKEN_TONES,
  // The grab-hand's settle after the hover shift overshoots slightly.
  cursorSpringEase: 'cubic-bezier(0.18, 0.9, 0.22, 1.18)',
  cursorInk: {
    fill: 'white',
    outline: '#202125',
  },
  // The scene renders the product's Inter; the site stack is the fallback.
  appFont: `'Inter', ${fontFamily('sans')}`,
  // The WebGL dash backdrop behind the board (authored shader knobs).
  backdrop: {
    activeHoverX: 0.16,
    activeHoverY: 0.46,
    dashColor: '#777777',
    flipImageY: true,
    halftonePower: -0.3,
    halftoneScalePx: 18,
    halftoneWidth: 0.3,
    hoverDashColor: '#777777',
    hoverHalftoneRadius: 0.45,
    hoverLightIntensity: 0.85,
    hoverLightRadius: 0.6,
    imageContrast: 0.7,
    previewDistance: 4,
  },
};
