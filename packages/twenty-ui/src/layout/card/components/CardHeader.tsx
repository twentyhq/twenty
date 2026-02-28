import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { type ReactNode } from 'react';

const StyledCardHeader = styled.div`
  background-color: ${theme.background.primary};
  border-bottom: 1px solid ${theme.border.color.medium};
  font-size: ${theme.font.size.sm};
  font-weight: ${theme.font.weight.medium};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
`;

export const CardHeader = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return <StyledCardHeader className={className}>{children}</StyledCardHeader>;
};
