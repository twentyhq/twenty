import { styled } from '@linaria/react';

import { FONT_WEIGHT, fontFamily, fontSize, semanticColor } from '@/tokens';

// Primary profile section headings (Case studies, Services). Stronger
// than ProfileEyebrow, which stays for rail labels and secondary meta blocks.
export const ProfileSectionTitle = styled.h2`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5.25)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.02em;
  line-height: 1.15;
`;
