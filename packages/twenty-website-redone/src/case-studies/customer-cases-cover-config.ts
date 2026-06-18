import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

// The case-study cover halftone: the studio band defaults (the same export the
// why-twenty hero and releases milestone use) over the cover photo, cover-fit,
// with a pointer-driven halftone shift toward the lighter hover dash. The
// per-card dash colors come from the catalog accent palette.
export function buildCustomerCasesCoverSettings({
  dashColor,
  hoverDashColor,
}: {
  dashColor: number;
  hoverDashColor: number;
}): HalftoneImageBackdropProps['settings'] {
  return {
    previewDistance: 4,
    imageFit: 'cover',
    contrast: 1,
    halftone: {
      scale: 24.72,
      power: -0.07,
      width: 0.46,
      minimumTone: 0,
      dashColor,
      hoverDashColor,
    },
    hover: {
      halftoneEnabled: true,
      halftonePowerShift: 0.45,
      halftoneRadius: 0.6,
      halftoneWidthShift: -0.1,
      lightEnabled: false,
      lightIntensity: 0.8,
      lightRadius: 0.2,
      fadeIn: 10,
      fadeOut: 5,
    },
    pointer: {
      follow: 0.3,
      velocityDamping: 0.82,
    },
    wave: {
      enabled: false,
      amount: 2,
      speed: 1,
    },
  };
}
