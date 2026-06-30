import { styled } from '@linaria/react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { color, mediaUp, radius } from '@/tokens';

import { PARTNER_HERO_VISUAL } from './partner-visual-config';

// The partner hero's halftone illustration sits in a fixed-height stage on the
// dark panel (the old secondary surface): the WebGL backdrop fills it, and the
// halftone's transparent areas read against that panel.
const VisualFrame = styled.div`
  background-color: ${color('black')};
  border-radius: ${radius(1)};
  height: 360px;
  overflow: hidden;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    height: 462px;
  }
`;

export function PartnerVisual() {
  return (
    <VisualFrame data-illustration="partner-hero">
      <HalftoneImageBackdrop
        imageUrl={PARTNER_HERO_VISUAL.imageUrl}
        priority
        settings={PARTNER_HERO_VISUAL.settings}
      />
    </VisualFrame>
  );
}
