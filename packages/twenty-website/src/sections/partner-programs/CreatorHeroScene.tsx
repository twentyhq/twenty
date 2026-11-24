'use client';

import { styled } from '@linaria/react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { paletteColorNumber } from '@/tokens';

const IMAGE_URL = '/images/partners/hero/creator-hero-scene.webp';

// Fills the hero so the field has no seam at its edges.
const Mount = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

// The creator hero's halftone field, wired like AppsBackdrop, with denser
// marks closer to the home hero: a hand raising a microphone on the left, a
// ring light and a camera on the right, as blue dashes behind the whole hero,
// the copy opting out of the hover light.
export function CreatorHeroScene() {
  const dashColor = paletteColorNumber('blue');

  return (
    <Mount>
      <HalftoneImageBackdrop
        imageUrl={IMAGE_URL}
        settings={{
          previewDistance: 4,
          imageFit: 'cover',
          applyToDarkAreas: true,
          contrast: 1,
          halftone: {
            scale: 8,
            power: -0.6,
            width: 0.34,
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
          pointerExcludeSelector: '[data-halftone-exclude]',
          pointerScope: 'window',
        }}
      />
    </Mount>
  );
}
