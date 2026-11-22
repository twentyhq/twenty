import { styled } from '@linaria/react';

import { fontFamily, fontSize, semanticColor } from '@/tokens';

export const SubHead = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  text-transform: uppercase;
`;
