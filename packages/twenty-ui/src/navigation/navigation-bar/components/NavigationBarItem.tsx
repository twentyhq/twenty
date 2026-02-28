import { useContext } from 'react';

import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext, themeVar } from '@ui/theme';

const StyledIconButton = styled.div<{ isActive?: boolean }>`
  align-items: center;
  background-color: ${({ isActive }) =>
    isActive ? themeVar.background.transparent.light : 'none'};
  border-radius: ${themeVar.spacing[1]};
  cursor: pointer;
  display: flex;
  height: ${themeVar.spacing[10]};
  justify-content: center;
  transition: background-color ${themeVar.animation.duration.fast}s ease;
  width: ${themeVar.spacing[10]};

  &:hover {
    background-color: ${themeVar.background.transparent.light};
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledIconButton isActive={isActive} onClick={onClick}>
      <Icon color={theme.color.gray10} size={theme.icon.size.lg} />
    </StyledIconButton>
  );
};
