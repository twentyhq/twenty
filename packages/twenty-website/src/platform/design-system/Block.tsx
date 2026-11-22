import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

export const Block = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;
