import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';
import { type ComponentPropsWithoutRef } from 'react';

const StyledCardHeader = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
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
