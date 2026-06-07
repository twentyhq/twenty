export const WINDOW_SHADOWS = {
  resting: '0 10px 64px 0 rgba(0, 0, 0, 0.2)',
  elevated:
    '0 14px 80px 0 rgba(0, 0, 0, 0.26), 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
  // Same weight as resting (64px blur, ~0.2), but pushed downward with a modest
  // negative spread so the bulk drops below the window instead of haloing over
  // the title bar — used by the product hero window.
  floating: '0 32px 64px -16px rgba(0, 0, 0, 0.28)',
  mobileResting: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
  mobileElevated: '0 6px 20px 0 rgba(0, 0, 0, 0.12)',
  mobileFloating: '0 12px 24px -6px rgba(0, 0, 0, 0.13)',
} as const;
