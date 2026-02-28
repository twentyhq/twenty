import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { type ReactNode } from 'react';

const StyledCard = styled.div<{
  fullWidth?: boolean;
  rounded?: boolean;
}>`
  border: 1px solid ${theme.border.color.medium};
  border-radius: ${({ rounded }) =>
    rounded ? theme.border.radius.md : theme.border.radius.sm};
  color: ${theme.font.color.secondary};
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

export const Card = ({
  children,
  className,
  fullWidth,
  rounded,
}: {
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  rounded?: boolean;
}) => {
  return (
    <StyledCard className={className} fullWidth={fullWidth} rounded={rounded}>
      {children}
    </StyledCard>
  );
};
