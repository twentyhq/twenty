import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';
import { type ComponentPropsWithoutRef } from 'react';

const StyledCardFooter = styled.div<{ divider?: boolean }>`
  background-color: ${themeCssVariables.background.primary};
  border-top: ${({ divider = true }) =>
    divider ? `1px solid ${themeCssVariables.border.color.medium}` : '0'};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

type CardFooterProps = ComponentPropsWithoutRef<'div'> & {
  divider?: boolean;
};

export const CardFooter = ({
  children,
  className,
  divider,
  ...rest
}: CardFooterProps) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledCardFooter className={className} divider={divider} {...rest}>
      {children}
    </StyledCardFooter>
  );
};
