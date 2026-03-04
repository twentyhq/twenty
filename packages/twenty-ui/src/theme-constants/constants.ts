// CSS custom properties don't work in media queries, so MOBILE_VIEWPORT
// must be a static number rather than a var(--...) reference.
export const MOBILE_VIEWPORT = 768;

// Numeric icon size/stroke constants for components that require pixel values
// (e.g. icon size props) rather than CSS variable strings.
export const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const ICON_STROKES = {
  sm: 1.6,
  md: 2,
  lg: 2.5,
} as const;
