import { styled } from '@linaria/react';
import { type ThemeType } from '@ui/theme';

const StyledList = styled.ul<{ depth: number; theme: ThemeType }>`
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: ${({ theme }) => theme.spacing(2)};

  ${({ theme, depth }) =>
    depth > 0
      ? `
      padding-left: ${theme.spacing(8)};

      > :first-of-type {
        margin-top: ${theme.spacing(2)};
      }
    `
      : ''}
`;

export { StyledList as JsonList };
