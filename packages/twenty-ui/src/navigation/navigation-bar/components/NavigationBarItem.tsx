import { useContext } from 'react';

import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledIconButton = styled.div<{ isActive?: boolean; theme: ThemeType }>`
  align-items: center;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.background.transparent.light : 'none'};
  border-radius: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  justify-content: center;
  transition: background-color ${({ theme }) => theme.animation.duration.fast}s
    ease;
  width: ${({ theme }) => theme.spacing(10)};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
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
    <StyledIconButton isActive={isActive} onClick={onClick} theme={theme}>
      <Icon color={theme.color.gray10} size={theme.icon.size.lg} />
    </StyledIconButton>
  );
};
