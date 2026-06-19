import { styled } from '@linaria/react';

import { semanticColor } from '@/tokens';

// The 10px hairline that separates inline items (nav groups, social chips).
export const VerticalDivider = styled.span`
  background-color: ${semanticColor.divider};
  flex-shrink: 0;
  height: 10px;
  width: 1px;
`;
