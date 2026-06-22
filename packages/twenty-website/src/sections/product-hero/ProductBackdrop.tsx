'use client';

import { paletteColorNumber, type PaletteToken } from '@/tokens';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

const BACKGROUND_IMAGE_URL = '/images/product/product-hero-background.webp';

// The wheat field behind both hero layers, drawn in each layer's dash
// ink (blue over the light intro, white over the dark AI layer). Knobs
// ported verbatim from the old product halftone; one shared pipeline.
export function ProductBackdrop({ dash }: { dash: PaletteToken }) {
  const dashColor = paletteColorNumber(dash);

  return (
    <HalftoneImageBackdrop
      imageUrl={BACKGROUND_IMAGE_URL}
      settings={{
        previewDistance: 4,
        imageFit: 'cover',
        contrast: 0.95,
        halftone: {
          scale: 8,
          power: 0.1,
          width: 0.52,
          minimumTone: 0,
          dashColor,
          hoverDashColor: dashColor,
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
      }}
    />
  );
}
