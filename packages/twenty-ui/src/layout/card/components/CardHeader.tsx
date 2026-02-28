import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { type ComponentPropsWithoutRef } from 'react';

const StyledCardHeader = styled.div`
  background-color: ${theme.background.primary};
  border-bottom: 1px solid ${theme.border.color.medium};
  font-size: ${theme.font.size.sm};
  font-weight: ${theme.font.weight.medium};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
`;

type CardHeaderProps = ComponentPropsWithoutRef<'div'>;

export const CardHeader = ({
  children,
  className,
  ...rest
}: CardHeaderProps) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledCardHeader className={className} {...rest}>
      {children}
    </StyledCardHeader>
  );
};
