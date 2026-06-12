import { fontFamily } from '../font-family';
import { CURSOR_GLYPH_SHADOW } from '../cursor-glyph';

// The live-data feature scene's authored inks and motion, ported
// verbatim from the old ThreeCards visual styles. The table itself
// renders the app-preview vocabulary; these are the scene's own inks.
export const LIVE_DATA_SCENE = {
  colors: {
    backdrop: '#1b1b1b',
    black: '#1f1f1f',
    bobCursor: '#EDB7FF',
    blue: '#1961ed',
    blueBorder: '#edf2fe',
    blueSurface: '#f5f9fd',
    green: '#18794e',
    greenSurface: '#ddf3e4',
    muted: '#999999',
    orange: '#ffb08d',
    purple: '#7869ff',
    text: '#333333',
    textLight: '#b3b3b3',
    textSecondary: '#666666',
    white: '#ffffff',
    yellow: '#fff6a5',
    panelBorderRing: '0 0 0 1px rgba(241, 241, 241, 0.9)',
    panelActiveShadow:
      '0 0 0 1px rgba(241, 241, 241, 0.9), 0 14px 28px rgba(15, 23, 42, 0.08)',
    rowBorder: '#f1f1f1',
    softWash: 'rgba(0, 0, 0, 0.04)',
    filterPressedInset: 'inset 0 0 0 1px rgba(25, 97, 237, 0.08)',
    filterPressedWash: 'rgba(25, 97, 237, 0.08)',
    filterHoverWash: 'rgba(25, 97, 237, 0.06)',
    cursorShadow: CURSOR_GLYPH_SHADOW,
    // The status tag's edited (purple) state inside the table.
    tagGreen: '#18794e',
    tagGreenSurface: '#ddf3e4',
    tagPurple: '#793aaf',
    tagPurpleSurface: '#f3e7fc',
  },
  // The Employees chip's pop-away overshoot and the new rows' arrival.
  popAwayEase: 'cubic-bezier(0.18, 1, 0.32, 1)',
  rowEnterEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
  appFont: `'Inter', ${fontFamily('sans')}`,
  backdrop: {
    activeHoverX: 0.16,
    activeHoverY: 0.46,
    dashColor: '#777777',
    flipImageY: false,
    halftonePower: -0.2,
    halftoneScalePx: 28,
    halftoneWidth: 0.4,
    hoverDashColor: '#777777',
    hoverHalftoneRadius: 0.45,
    hoverLightIntensity: 0.85,
    hoverLightRadius: 0.6,
    imageContrast: 1,
    previewDistance: 4,
  },
};
