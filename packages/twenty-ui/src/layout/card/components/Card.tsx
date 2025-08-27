import { styled } from '@linaria/react';

const StyledCard = styled.div<{ fullWidth?: boolean; rounded?: boolean }>`
  border: 1px solid var(--color-border-medium);
  border-radius: ${({ rounded }) =>
    rounded ? 'var(--border-radius-md)' : 'var(--border-radius-sm)'};
  color: var(--color-font-secondary);
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export { StyledCard as Card };
