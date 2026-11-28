import { styled } from '@linaria/react';

import { fontSize, semanticColor } from '@/tokens';

export const Hint = styled.p`
  color: ${semanticColor.inkMuted};
  font-size: ${fontSize(3.25)};
`;
