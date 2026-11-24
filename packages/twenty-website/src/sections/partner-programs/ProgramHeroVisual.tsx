import { styled } from '@linaria/react';

import {
  HalftoneImageBackdrop,
  type HalftoneImageBackdropProps,
} from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { radius } from '@/tokens';

// WhyTwentyVisual's fixed 462px stage, holding one halftone artwork rendered
// live like the home hero bridge. Decorative — the hero heading carries the
// meaning — so the whole frame is hidden from assistive tech.
const VisualFrame = styled.div`
  border-radius: ${radius(1)};
  height: 462px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

type ProgramHeroVisualProps = {
  // Marks where the page's artwork goes.
  slot: string;
  backdrop: Pick<HalftoneImageBackdropProps, 'imageUrl' | 'settings'>;
};

export function ProgramHeroVisual({ backdrop, slot }: ProgramHeroVisualProps) {
  return (
    <VisualFrame aria-hidden data-model-slot={slot}>
      <HalftoneImageBackdrop
        imageUrl={backdrop.imageUrl}
        loading="eager"
        priority
        settings={backdrop.settings}
      />
    </VisualFrame>
  );
}
