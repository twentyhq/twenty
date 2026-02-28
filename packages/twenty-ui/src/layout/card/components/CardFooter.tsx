import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { type ComponentPropsWithoutRef } from 'react';

const StyledCardFooter = styled.div<{ divider?: boolean }>`
  background-color: ${theme.background.primary};
  border-top: ${({ divider = true }) =>
    divider ? `1px solid ${theme.border.color.medium}` : '0'};
  font-size: ${theme.font.size.sm};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
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
