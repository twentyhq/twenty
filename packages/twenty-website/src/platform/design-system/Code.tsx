import { styled } from '@linaria/react';

import { fontFamily, fontSize, semanticColor } from '@/tokens';

export const Code = styled.code`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  overflow-wrap: anywhere;
`;
