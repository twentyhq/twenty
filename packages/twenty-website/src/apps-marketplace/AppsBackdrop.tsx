'use client';

import { styled } from '@linaria/react';

import { paletteColorNumber } from '@/tokens';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

const BACKGROUND_IMAGE_URL = '/images/apps/hero-tile-towers.webp';

// Fills the hero so the field has no seam at its edges.
const Mount = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

// The apps hero's halftone field, on the home hero's pipeline: the photo's
// dark racks become blue marks on both edges, and its bright, empty middle
// stays clear behind the copy, as the sky does in the home hero.
export function AppsBackdrop() {
  const dashColor = paletteColorNumber('blue');

  return (
    <Mount>
      <HalftoneImageBackdrop
        imageUrl={BACKGROUND_IMAGE_URL}
        settings={{
          previewDistance: 4,
          imageFit: 'cover',
          applyToDarkAreas: true,
          contrast: 0.65,
          halftone: {
            scale: 7,
            power: -1.5,
            width: 0.3,
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
            lightIntensity: 0.6,
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
          // Same wiring as the home: the mount ignores the pointer, so the
          // rig listens on the window and goes quiet over the copy.
          pointerExcludeSelector: '[data-apps-stage-copy]',
          pointerScope: 'window',
        }}
      />
    </Mount>
  );
}
