import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';
import { type ReactNode } from 'react';

const StyledCardFooter = styled.div<{ divider?: boolean }>`
  background-color: ${themeVar.background.primary};
  border-top: ${({ divider = true }) =>
    divider ? `1px solid ${themeVar.border.color.medium}` : '0'};
  font-size: ${themeVar.font.size.sm};
  padding: ${themeVar.spacing[2]} ${themeVar.spacing[4]};
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
