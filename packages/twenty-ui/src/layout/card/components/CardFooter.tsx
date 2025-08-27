import { styled } from '@linaria/react';

const StyledCardFooter = styled.div<{ divider?: boolean }>`
  background-color: var(--background-primary);
  border-top: ${({ divider = true }) =>
    divider ? '1px solid var(--border-color-medium)' : 0};
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) var(--spacing-4);
`;

export { StyledCardFooter as CardFooter };
