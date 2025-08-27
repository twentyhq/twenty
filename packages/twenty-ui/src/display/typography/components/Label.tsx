import { styled } from '@linaria/react';

export type LabelVariant = 'default' | 'small';

const StyledLabel = styled.div<{ variant?: LabelVariant }>`
  color: var(--font-color-light);
  font-size: ${({ variant = 'default' }) => {
    switch (variant) {
      case 'default':
        return '11px';
      case 'small':
        return '9px';
    }
  }};
  font-weight: var(--font-weight-semi-bold);
`;

export { StyledLabel as Label };
