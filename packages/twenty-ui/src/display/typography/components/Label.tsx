import { useContext } from 'react';
import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';

export type LabelVariant = 'default' | 'small';

const StyledLabel = styled.div<{ variant?: LabelVariant; theme: ThemeType }>`
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

type LabelProps = {
  variant?: LabelVariant;
} & React.HTMLAttributes<HTMLDivElement>;

export const Label = ({ variant, ...rest }: LabelProps) => {
  const { theme } = useContext(ThemeContext);

  return <StyledLabel variant={variant} theme={theme} {...rest} />;
};
