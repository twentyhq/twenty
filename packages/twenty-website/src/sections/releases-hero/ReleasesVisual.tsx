import { styled } from '@linaria/react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { color, mediaUp, radius } from '@/tokens';

import { RELEASES_VISUAL } from './releases-visual-config';

// The release-notes milestone halftone sits in a fixed-height stage: the WebGL
// backdrop fills it, and the halftone's transparent areas read against the iron
// (#777777) panel — the old Milestone scene's background.
const VisualFrame = styled.div`
  background-color: ${color('iron')};
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
  return (
    <VisualFrame data-illustration="release-notes-milestone">
      <HalftoneImageBackdrop
        imageUrl={RELEASES_VISUAL.imageUrl}
        priority
        settings={RELEASES_VISUAL.settings}
      />
    </VisualFrame>
  );
}
