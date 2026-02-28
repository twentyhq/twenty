import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';

const StyledRectangleIllustrationIcon = styled('div')`
  background-color: ${themeVar.background.primary};
  border: 0.75px solid ${themeVar.border.color.medium};
  border-radius: ${themeVar.border.radius.sm};
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
