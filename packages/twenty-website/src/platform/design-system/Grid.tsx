import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

export const Grid = styled.div<{ min: number }>`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: repeat(auto-fill, minmax(${({ min }) => min}px, 1fr));
`;
