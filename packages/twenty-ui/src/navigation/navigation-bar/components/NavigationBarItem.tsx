import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

const StyledIconButton = styled.div<{ isActive?: boolean }>`
  align-items: center;
  background-color: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.light : 'none'};
  border-radius: ${themeCssVariables.spacing[1]};
  cursor: pointer;
  display: flex;
  height: ${themeCssVariables.spacing[10]};
  justify-content: center;
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  width: ${themeCssVariables.spacing[10]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
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
}: NavigationBarItemProps) => (
  <StyledIconButton isActive={isActive} onClick={onClick}>
    <Icon
      color={themeCssVariables.grayScale.gray10}
      size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg)}
    />
  </StyledIconButton>
);
