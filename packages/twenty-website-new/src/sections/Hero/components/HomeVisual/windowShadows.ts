// Shared box-shadow tokens for floating windows inside the hero (Terminal +
// Twenty app window). Defined once so both shells stay visually consistent.
export const WINDOW_SHADOWS = {
  // Default resting state — the window is on-screen but not being interacted
  // with and not the frontmost window.
  resting: '0 10px 64px 0 rgba(0, 0, 0, 0.2)',
  // Elevated state — applied while the window is being dragged or resized, or
  // when it's the active / frontmost window. Slightly stronger diffuse shadow
  // plus a tight close shadow for depth.
  elevated:
    '0 14px 80px 0 rgba(0, 0, 0, 0.26), 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
  // Mobile resting shadow — lighter so the stacked window underneath isn't
  // washed out to a grey by the overlapping shadow.
  mobileResting: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
  mobileElevated: '0 6px 20px 0 rgba(0, 0, 0, 0.12)',
} as const;
