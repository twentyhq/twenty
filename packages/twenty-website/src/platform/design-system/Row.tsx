import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

export const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
`;
