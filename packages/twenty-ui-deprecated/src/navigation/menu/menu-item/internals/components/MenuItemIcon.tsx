import { type IconComponent, TintedIconTile } from '@ui/display';
import { type ThemeColor } from '@ui/theme';
import { ThemeContext } from '@ui/theme-constants';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemIconBoxContainer } from './MenuItemIconBoxContainer';

export type MenuItemIconProps = {
  Icon: IconComponent | null | undefined;
  iconThemeColor?: ThemeColor | null;
  withContainer?: boolean;
  withContainerBackground?: boolean;
};

export const MenuItemIcon = ({
  Icon,
  iconThemeColor,
  withContainer = false,
  withContainerBackground = true,
}: MenuItemIconProps) => {
  const { theme } = useContext(ThemeContext);

  if (!Icon) {
    return null;
  }

  if (isDefined(iconThemeColor)) {
    return (
      <TintedIconTile
        Icon={Icon}
        color={iconThemeColor}
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
      />
    );
  }

  const iconElement = (
    <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
  );

  if (withContainer) {
    return (
      <MenuItemIconBoxContainer hasBackground={withContainerBackground}>
        {iconElement}
      </MenuItemIconBoxContainer>
    );
  }

  return iconElement;
};
