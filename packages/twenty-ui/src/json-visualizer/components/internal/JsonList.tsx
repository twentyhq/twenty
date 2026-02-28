import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';

const StyledList = styled.ul<{ depth: number }>`
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: ${themeVar.spacing[2]};

  ${({ depth }) =>
    depth > 0
      ? `
      padding-left: ${themeVar.spacing[8]};

      > :first-of-type {
        margin-top: ${themeVar.spacing[2]};
      }
    `
      : ''}
`;

export { StyledList as JsonList };
