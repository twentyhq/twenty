import { styled } from '@linaria/react';

import { color, radius, semanticColor } from '@/tokens';

// The square halftone "mic" visual fills the promo's stage. The interactive
// WebGL canvas lands in the later visual pass; for now the framed surface
// reserves its footprint.
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
  return <MicFrame aria-hidden />;
}
