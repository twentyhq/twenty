'use client';

import { styled } from '@linaria/react';

import { paletteColorNumber } from '@/tokens';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

const BACKGROUND_IMAGE_URL = '/images/apps/hero-ribbons.webp';

// Fills the box AppsOrbit gives it.
const Mount = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

// The apps hero's pattern: rings of fine lines around the logo orbit, out to
// the screen's sides (hero_pattern.py, shape « halo »), never over the ring.
// AppsOrbit places it from the ring's own radius and centre. The partner
// programs' settings (CREATOR_HERO_BACKDROP): grey dashes, slow wave, blue
// under the cursor.
export function AppsBackdrop() {
  const dashColor = paletteColorNumber('stone');
  const hoverDashColor = paletteColorNumber('blue');

  return (
    <Mount>
      <HalftoneImageBackdrop
        imageUrl={BACKGROUND_IMAGE_URL}
        settings={{
          previewDistance: 4,
          imageFit: 'cover',
          applyToDarkAreas: true,
          contrast: 1,
          halftone: {
            scale: 9,
            power: -0.35,
            width: 0.34,
            minimumTone: 0,
            dashColor,
            hoverDashColor,
          },
          hover: {
            halftoneEnabled: true,
            // 0: under the cursor the dashes swell and turn blue, but white stays white,
            // so no dash appears over the copy or the hero's own element.
            halftonePowerShift: 0,
            halftoneRadius: 0.6,
            halftoneWidthShift: -0.2,
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
            enabled: true,
            amount: 1.5,
            speed: 0.6,
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
