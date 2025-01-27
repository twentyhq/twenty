import styled from '@emotion/styled';

export type LabelVariant = 'default' | 'small';

const StyledLabel = styled.div<{ variant?: LabelVariant }>`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ variant = 'default' }) => {
    switch (variant) {
      case 'default':
        return '11px';
      case 'small':
        return '9px';
    }
  }};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export { StyledLabel as Label };
