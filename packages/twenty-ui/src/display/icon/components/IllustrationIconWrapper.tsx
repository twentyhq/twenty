import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

const StyledRectangleIllustrationIcon = styled('div')`
  background-color: ${theme.background.primary};
  border: 0.75px solid ${theme.border.color.medium};
  border-radius: ${theme.border.radius.sm};
  display: flex;
  justify-content: center;
`;

export const IllustrationIconWrapper = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <StyledRectangleIllustrationIcon className={className}>
      {children}
    </StyledRectangleIllustrationIcon>
  );
};
