import { styled } from '@linaria/react';

const StyledColorableIconContainer = styled.div<{
  color: string;
}>`
  color: ${({ color }) => color};
  display: inline-flex;
`;

export const ColorableIconContainer = StyledColorableIconContainer;
