import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';
import { type ReactNode } from 'react';

const StyledCardHeader = styled.div`
  background-color: ${themeVar.background.primary};
  border-bottom: 1px solid ${themeVar.border.color.medium};
  font-size: ${themeVar.font.size.sm};
  font-weight: ${themeVar.font.weight.medium};
  padding: ${themeVar.spacing[2]} ${themeVar.spacing[4]};
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
