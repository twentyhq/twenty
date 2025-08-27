import { styled } from '@linaria/react';

const StyledContainer = styled.div<{ fixHeight: boolean }>`
  height: ${({ fixHeight }) => (fixHeight ? '20px' : 'auto')};
  display: flex;
  align-items: center;
`;

export const AutoGrowingCellContainer = StyledContainer;
