import { fontFamily } from '../font-family';
import { FICTION_PALETTE } from './fiction-palette';

// The fast-path feature scene's authored inks, ported verbatim from the
// old ThreeCards visual.
export const FAST_PATH_SCENE = {
  colors: {
    black: '#111111',
    border: FICTION_PALETTE.borderMedium,
    borderLight: FICTION_PALETTE.borderLight,
    muted: FICTION_PALETTE.inkDisabled,
    mutedStrong: FICTION_PALETTE.inkFaint,
    offWhite: '#f8f7f2',
    panel: FICTION_PALETTE.white,
    shadow: 'rgba(241, 241, 241, 0.9)',
    surfaceHover: 'rgba(0, 0, 0, 0.04)',
    textSecondary: FICTION_PALETTE.inkMuted,
    transparentMedium: 'rgba(0, 0, 0, 0.08)',
    shortcutKeyBorder: '#dddddd',
    panelShadow:
      '0 0 0 1px rgba(255, 255, 255, 0.16), 0 20px 48px rgba(0, 0, 0, 0.28)',
    confettiShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  },
  // The burst's paper-tone palette.
  confettiColors: {
    mist: '#d4cec4',
    pearl: '#ece7de',
    silver: '#bbb5ac',
    smoke: '#a6a095',
    softWhite: '#f7f4ee',
    white: FICTION_PALETTE.white,
  },
  cursorInk: {
    fill: 'white',
    outline: '#202125',
  },
  appFont: `'Inter', ${fontFamily('sans')}`,
  noiseImageUrl:
    '/images/home/three-cards-feature/fast-path-background-noise.webp',
  backdrop: {
    activeHoverX: 0.16,
    activeHoverY: 0.46,
    dashColor: FICTION_PALETTE.inkSoft,
    flipImageY: true,
    halftonePower: 0.3,
    halftoneScalePx: 28,
    halftoneWidth: 0.3,
    hoverDashColor: FICTION_PALETTE.inkSoft,
    hoverHalftoneRadius: 0.45,
    hoverLightIntensity: 0.85,
    hoverLightRadius: 0.6,
    imageContrast: 1,
    previewDistance: 4,
  },
};
