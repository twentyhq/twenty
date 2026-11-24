import { styled } from '@linaria/react';

import {
  HalftoneImageBackdrop,
  type HalftoneImageBackdropProps,
} from '@/platform/visuals/rigs/HalftoneImageBackdrop';
// Fills ProgramHero's stage with one halftone artwork rendered live like the
// home hero bridge. Decorative — the hero heading carries the meaning — so the
// whole frame is hidden from assistive tech.
const VisualFrame = styled.div`
  inset: 0;
  position: absolute;
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
