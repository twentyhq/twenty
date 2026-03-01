import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

const StyledList = styled.ul<{ depth: number }>`
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: ${themeCssVariables.spacing[2]};

  ${({ depth }) =>
    depth > 0
      ? `
      padding-left: ${themeCssVariables.spacing[8]};

      > :first-of-type {
        margin-top: ${themeCssVariables.spacing[2]};
      }
    `
      : ''}
`;

export { StyledList as JsonList };
