import { styled } from '@linaria/react';

import { color, mediaUp, radius } from '@/tokens';

// The release-notes WebGL scene sits in a fixed-height stage. The interactive
// visual lands in the later visual pass; for now the stage reserves its
// 462/360 footprint so the hero rhythm is already correct.
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

export function ReleasesVisual() {
  return <VisualFrame />;
}
