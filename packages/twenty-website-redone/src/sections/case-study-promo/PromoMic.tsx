import { styled } from '@linaria/react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { color, radius, semanticColor } from '@/tokens';

import { PROMO_MIC_VISUAL } from './promo-mic-config';

// The square halftone fills the promo's stage: iron dashes form the meeting
// photo on the light panel (toneTarget dark), turning blue under the cursor's
// hover light.
const MicFrame = styled.div`
  background-color: ${color('neutral')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(3)};
  inset: 0;
  overflow: hidden;
  position: absolute;
  z-index: 1;
`;

export function PromoMic() {
  return (
    <MicFrame aria-hidden data-illustration="promo-mic">
      <HalftoneImageBackdrop
        imageUrl={PROMO_MIC_VISUAL.imageUrl}
        settings={PROMO_MIC_VISUAL.settings}
      />
    </MicFrame>
  );
}
