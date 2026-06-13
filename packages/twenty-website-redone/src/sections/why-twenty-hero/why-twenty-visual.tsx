import { styled } from '@linaria/react';

import { color, radius } from '@/tokens';

// The why-twenty WebGL scene (background image + halftone) sits in a fixed
// 462px stage. The interactive visual lands in the later visual pass; for now
// the stage reserves its footprint on the dark hero.
const VisualFrame = styled.div`
  background-color: ${color('charcoal')};
  border-radius: ${radius(1)};
  height: 462px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

export function WhyTwentyVisual() {
  return <VisualFrame />;
}
