'use client';

import { styled } from '@linaria/react';

import { useMediaQuery } from '@/platform/motion';
import { HalftoneModel } from '@/platform/visuals/rigs/halftone-model';
import { BREAKPOINT_PX, mediaUp, spacing, Z_INDEX } from '@/tokens';

import { FOOTER_BACKDROP } from './footer-backdrop-config';

// Stacked layouts: the card covers the stage, so the model lifts into the
// visible top strip (user-directed; desktop keeps the authored placement).
const STACKED_MODEL_OFFSET_Y = 1.15;
const STACKED_SETTINGS = {
  ...FOOTER_BACKDROP.settings,
  modelOffsetY: STACKED_MODEL_OFFSET_Y,
};

// Fills the stage behind the card (the card layers above), as authored.
// On stacked layouts the card covers most of the stage, so the backdrop
// anchors to the top strip where it is actually visible (user-directed;
// desktop keeps the authored full-stage placement).
const BackdropRoot = styled.div`
  height: 560px;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: ${spacing(12)};
  z-index: ${Z_INDEX.base};

  ${mediaUp('md')} {
    height: auto;
    inset: 0;
  }
`;

export function FooterBackdrop() {
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINT_PX.md}px)`);

  return (
    <BackdropRoot aria-hidden data-illustration="footer-backdrop">
      <HalftoneModel
        initialPose={FOOTER_BACKDROP.initialPose}
        key={isDesktop ? 'desktop' : 'stacked'}
        modelUrl={FOOTER_BACKDROP.modelUrl}
        settings={isDesktop ? FOOTER_BACKDROP.settings : STACKED_SETTINGS}
      />
    </BackdropRoot>
  );
}
