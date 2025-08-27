import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';

const StyledIconButton = styled.div<{ isActive?: boolean }>`
  align-items: center;
  background-color: ${({ isActive }) =>
    isActive ? 'var(--background-transparent-light)' : 'none'};
  border-radius: var(--border-radius-1);
  cursor: pointer;
  display: flex;
  height: var(--spacing-10);
  justify-content: center;
  transition: background-color var(--animation-duration-fast) ease;
  width: var(--spacing-10);

  &:hover {
    background-color: var(--background-transparent-light);
  }
`;

type NavigationBarItemProps = {
  Icon: IconComponent;
  isActive: boolean;
  onClick: () => void;
};

export const NavigationBarItem = ({
  Icon,
  isActive,
  onClick,
}: NavigationBarItemProps) => {
  const theme = useTheme();

  return (
    <StyledIconButton isActive={isActive} onClick={onClick}>
      <Icon color={theme.color.gray50} size={theme.icon.size.lg} />
    </StyledIconButton>
  );
};
