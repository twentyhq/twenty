import { useContext } from 'react';

import { styled } from '@linaria/react';
import { type IconComponent, IconGripVertical } from '@ui/display';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { MenuItemIconBoxContainer } from './MenuItemIconBoxContainer';

const StyledIconSwapContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledDefaultIcon = styled.div`
  display: flex;
  transition: opacity calc(${themeCssVariables.animation.duration.instant} * 1s)
    ease;
`;

const StyledHoverIcon = styled.div`
  position: absolute;
  display: flex;
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.instant} * 1s)
    ease;
`;

export type MenuItemIconWithGripSwapProps = {
  LeftIcon: IconComponent | null | undefined;
  withIconContainer?: boolean;
  gripIconColor: string;
};

export const MenuItemIconWithGripSwap = ({
  LeftIcon,
  withIconContainer = false,
  gripIconColor,
}: MenuItemIconWithGripSwapProps) => {
  const { theme } = useContext(ThemeContext);

  if (!LeftIcon) {
    return null;
  }

  const iconContent = (
    <StyledIconSwapContainer>
      <StyledDefaultIcon className="grip-swap-default-icon">
        <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      </StyledDefaultIcon>
      <StyledHoverIcon className="grip-swap-hover-icon">
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={gripIconColor}
        />
      </StyledHoverIcon>
    </StyledIconSwapContainer>
  );

  if (withIconContainer) {
    return <MenuItemIconBoxContainer>{iconContent}</MenuItemIconBoxContainer>;
  }

  return iconContent;
};
