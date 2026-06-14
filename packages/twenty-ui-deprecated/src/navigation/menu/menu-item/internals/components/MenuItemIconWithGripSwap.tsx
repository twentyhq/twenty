import { styled } from '@linaria/react';
import {
  type IconComponent,
  IconGripVertical,
  TintedIconTile,
} from '@ui/display';
import { type ThemeColor } from '@ui/theme';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
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
  iconThemeColor?: ThemeColor | null;
  withIconContainer?: boolean;
  gripIconColor: string;
};

export const MenuItemIconWithGripSwap = ({
  LeftIcon,
  iconThemeColor,
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
        {isDefined(iconThemeColor) ? (
          <TintedIconTile
            Icon={LeftIcon}
            color={iconThemeColor}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        ) : (
          <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
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

  if (withIconContainer && !isDefined(iconThemeColor)) {
    return <MenuItemIconBoxContainer>{iconContent}</MenuItemIconBoxContainer>;
  }

  return iconContent;
};
