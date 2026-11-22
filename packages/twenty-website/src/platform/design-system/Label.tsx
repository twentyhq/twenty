import { styled } from '@linaria/react';

import { fontFamily, fontSize, semanticColor } from '@/tokens';

export const Label = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
`;
