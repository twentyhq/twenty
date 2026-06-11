import { paletteColorNumber } from '@/tokens';

import { type HalftoneImageBackdropProps } from '@/platform/visuals/rigs/halftone-image-backdrop';

// The authored bridge framing per viewport band. These thresholds are the
// artwork's own (how the bridge crops against the copy), independent of
// the site grid — ported verbatim.
const FRAME_TUNES = [
  {
    maxWidthPx: 767,
    previewDistance: 3.2,
    verticalAnchor: 0,
    verticalOffsetPx: 0,
    horizontalOffsetPx: -60,
  },
  {
    maxWidthPx: 1199,
    previewDistance: 3.2,
    verticalAnchor: 0.5,
    verticalOffsetPx: 0,
    horizontalOffsetPx: -120,
  },
  {
    maxWidthPx: Number.POSITIVE_INFINITY,
    previewDistance: 3.2,
    verticalAnchor: 0.5,
    verticalOffsetPx: 224,
    horizontalOffsetPx: -151,
  },
];

function resolveFrameTune() {
  const viewportWidth =
    typeof window === 'undefined'
      ? Number.POSITIVE_INFINITY
      : window.innerWidth;
  const tune =
    FRAME_TUNES.find((candidate) => viewportWidth <= candidate.maxWidthPx) ??
    FRAME_TUNES[FRAME_TUNES.length - 1];
  return {
    previewDistance: tune.previewDistance,
    verticalAnchor: tune.verticalAnchor,
    verticalOffsetPx: tune.verticalOffsetPx,
    horizontalOffsetPx: tune.horizontalOffsetPx,
  };
}

// The hero bridge: blue dashes grown from the artwork's DARK areas, full
// horizontal span at every width, hover light fading toward the top and
// bottom edges. The copy block opts out via [data-halftone-exclude].
export const HERO_BACKDROP: Pick<
  HalftoneImageBackdropProps,
  'imageUrl' | 'settings'
> = {
  imageUrl: '/images/home/hero-bridge.webp',
  settings: {
    previewDistance: 3.2,
    imageFit: 'width',
    verticalAnchor: 0.5,
    applyToDarkAreas: true,
    contrast: 1,
    halftone: {
      scale: 12,
      power: -0.07,
      width: 0.34,
      minimumTone: 0,
      dashColor: paletteColorNumber('blue'),
      hoverDashColor: paletteColorNumber('blue'),
    },
    hover: {
      halftoneEnabled: false,
      halftonePowerShift: 0,
      halftoneRadius: 0.6,
      halftoneWidthShift: 0,
      lightEnabled: true,
      lightIntensity: 0.8,
      lightRadius: 0.14,
      lightVerticalFade: 0.5,
      fadeIn: 18,
      fadeOut: 7,
    },
    pointer: {
      follow: 0.38,
      velocityDamping: 0.82,
    },
    wave: {
      enabled: false,
      amount: 0,
      speed: 1,
    },
    responsiveFrame: resolveFrameTune,
    pointerExcludeSelector: '[data-halftone-exclude]',
    pointerScope: 'window',
    virtualRenderHeight: 768,
  },
};
