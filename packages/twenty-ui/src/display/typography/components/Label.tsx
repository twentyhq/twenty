import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

export type LabelVariant = 'default' | 'small';

const StyledLabel = styled.div<{ variant?: LabelVariant }>`
  color: ${theme.font.color.light};
  font-size: ${({ variant = 'default' }) => {
    switch (variant) {
      case 'default':
        return '11px';
      case 'small':
        return '9px';
    }
  }};
  font-weight: ${theme.font.weight.semiBold};
`;

type LabelProps = {
  variant?: LabelVariant;
  children?: React.ReactNode;
  className?: string;
};

export const Label = ({ variant, children, className }: LabelProps) => {
  return (
    <StyledLabel variant={variant} className={className}>
      {children}
    </StyledLabel>
  );
};
