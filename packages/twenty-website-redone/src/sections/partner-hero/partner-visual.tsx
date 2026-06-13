import { styled } from '@linaria/react';

import { color, mediaUp, radius } from '@/tokens';

// The partner hero's halftone illustration sits in a fixed-height stage. The
// interactive WebGL halftone overlay lands next; for now the stage reserves
// its footprint so the hero's vertical rhythm is already correct.
const VisualFrame = styled.div`
  background-color: ${color('neutral')};
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
  return <VisualFrame />;
}
