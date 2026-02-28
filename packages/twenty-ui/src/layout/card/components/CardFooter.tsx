import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { type ReactNode } from 'react';

const StyledCardFooter = styled.div<{ divider?: boolean }>`
  background-color: ${theme.background.primary};
  border-top: ${({ divider = true }) =>
    divider ? `1px solid ${theme.border.color.medium}` : '0'};
  font-size: ${theme.font.size.sm};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
`;

export const CardFooter = ({
  children,
  className,
  divider,
}: {
  children?: ReactNode;
  className?: string;
  divider?: boolean;
}) => {
  return (
    <StyledCardFooter className={className} divider={divider}>
      {children}
    </StyledCardFooter>
  );
};
