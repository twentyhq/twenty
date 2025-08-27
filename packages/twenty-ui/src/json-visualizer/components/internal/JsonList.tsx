import { css } from '@linaria/core';
import { styled } from '@linaria/react';

const StyledList = styled.ul<{ depth: number }>`
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: var(--spacing-2);

  ${({ depth }) =>
    depth > 0
      ? css`
          padding-left: var(--spacing-8);

          > :first-of-type {
            margin-top: var(--spacing-2);
          }
        `
      : css``}
`;

export { StyledList as JsonList };
