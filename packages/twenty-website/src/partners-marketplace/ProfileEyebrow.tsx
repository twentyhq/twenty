import { styled } from '@linaria/react';

import { FONT_WEIGHT, fontFamily, fontSize, semanticColor } from '@/tokens';

// The mono, uppercase section label used throughout the profile (served
// regions, skills, location, rates, reach-out). The old site rendered some of
// these at regular weight and some at medium; the redone settles on one weight.
export const ProfileEyebrow = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
  text-transform: uppercase;
`;
