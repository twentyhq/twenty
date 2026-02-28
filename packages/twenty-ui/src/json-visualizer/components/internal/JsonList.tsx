import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

const StyledList = styled.ul<{ depth: number }>`
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: ${theme.spacing[2]};

  ${({ depth }) =>
    depth > 0
      ? `
      padding-left: ${theme.spacing[8]};

      > :first-of-type {
        margin-top: ${theme.spacing[2]};
      }
    `
      : ''}
`;

export { StyledList as JsonList };
