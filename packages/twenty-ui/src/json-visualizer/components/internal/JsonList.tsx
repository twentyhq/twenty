import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledList = styled.ul<{ depth: number }>`
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: ${({ theme }) => theme.spacing(2)};

  ${({ theme, depth }) =>
    depth > 0 &&
    css`
      padding-left: ${theme.spacing(8)};

      > :first-of-type {
        margin-top: ${theme.spacing(2)};
      }
    `}
`;

export { StyledList as JsonList };
