import { FICTION_PALETTE } from './fiction-palette';

// The product stepper's authored light-window fiction (the no-code
// editors floating over the dark dash stage) — verbatim from the old
// stepper-visual-tokens plus the per-visual inks that lived inline.
export const PRODUCT_STEPPER_SCENE = {
  shell: {
    background: FICTION_PALETTE.white,
    cardBackground: FICTION_PALETTE.cardBackground,
    text: '#333',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textMuted: FICTION_PALETTE.inkMuted,
    borderMedium: FICTION_PALETTE.borderMedium,
    borderStrong: FICTION_PALETTE.borderStrong,
    borderLight: FICTION_PALETTE.borderLight,
    borderSubtle: 'rgba(0, 0, 0, 0.08)',
    font: "'Inter', sans-serif",
    shadowSm: '0 1px 6px rgba(0, 0, 0, 0.05)',
    tint: 'rgba(0, 0, 0, 0.04)',
    headerBackground: '#d9e2fc',
    headerBorder: '#c6d4f9',
  },
  badges: {
    standard: {
      background: '#f0f4ff',
      border: '#e6edfe',
      text: FICTION_PALETTE.accent,
    },
    custom: { background: '#fff1e7', border: '#ffe8d7', text: '#f76808' },
  },
  entityTones: {
    indigo: { background: '#d9e2fc', border: '#c6d4f9' },
    purple: { background: '#eddbf9', border: '#e3ccf4' },
    red: { background: '#fdd8d8', border: '#f9c6c6' },
    green: { background: '#d4f4e2', border: '#b4e7cf' },
  },
  workflow: {
    green: '#30a46c',
    gray: FICTION_PALETTE.inkFaint,
    tealBackground: '#e7f9f5',
    grayBackground: '#f9f9f9',
    accents: {
      blue: '#3e63dd',
      gray: FICTION_PALETTE.inkMuted,
      green: '#193b2d',
      pink: '#d6409f',
      red: '#e5484d',
    },
  },
  navTiles: {
    blue: { background: '#d2deff', border: '#c1d0ff', icon: '#3a5bc7' },
    red: { background: '#ffcdce', border: '#fdbdbe', icon: '#ce2c31' },
    turquoise: { background: '#b8eae0', border: '#a1ded2', icon: '#008573' },
    gray: { background: '#ebebeb', border: '#d6d6d6', icon: '#666666' },
    orange: { background: '#ffd19a', border: '#ffc182', icon: '#cc4e00' },
  },
  layout: {
    accent: FICTION_PALETTE.accent,
    panelAccent: '#4a38f5',
    dragWash: 'rgba(59, 130, 246, 0.04)',
    chipWash: 'rgba(0, 0, 0, 0.02)',
    fieldInk: FICTION_PALETTE.inkMuted,
    eyeInk: FICTION_PALETTE.inkFaint,
    eyeHiddenInk: FICTION_PALETTE.inkDisabled,
  },
  cardShadow: '0 0 2px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.04)',
  nodeShadow: '0 0 2px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
};
