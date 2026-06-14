import { styled } from '@linaria/react';

import { HalftoneModel } from '@/platform/visuals/rigs/halftone-model';
import { mediaUp, radius } from '@/tokens';

import { PARTNER_QUOTE_VISUAL } from './partner-quote-config';

// The quote-mark GLB renders at this size and the carousel scales it up; it's
// decorative (the decoration container is desktop-only + aria-hidden).
const QuoteFrame = styled.div`
  border-radius: ${radius(1)};
  height: 279px;
  overflow: hidden;
  position: relative;
  width: 198px;

  ${mediaUp('md')} {
    height: 476px;
    width: 336px;
  }
`;

export function PartnerQuoteVisual() {
  return (
    <QuoteFrame data-illustration="partner-quote">
      <HalftoneModel
        initialPose={PARTNER_QUOTE_VISUAL.initialPose}
        modelUrl={PARTNER_QUOTE_VISUAL.modelUrl}
        settings={PARTNER_QUOTE_VISUAL.settings}
      />
    </QuoteFrame>
  );
}
