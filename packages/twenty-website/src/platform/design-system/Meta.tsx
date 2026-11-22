import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

export const Meta = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(0.5)};
  }
`;
