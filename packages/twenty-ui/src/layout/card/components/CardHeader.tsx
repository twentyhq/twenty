import { styled } from '@linaria/react';

const StyledCardHeader = styled.div`
  background-color: var(--color-background-primary);
  border-bottom: 1px solid var(--color-border-medium);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-2) var(--spacing-4);
`;

export { StyledCardHeader as CardHeader };
