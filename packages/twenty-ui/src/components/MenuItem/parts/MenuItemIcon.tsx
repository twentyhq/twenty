import { MenuItemIconBoxContainer } from '@ui/components/MenuItem/parts/MenuItemIconBoxContainer';
import { TintedIconTile } from '@ui/components/TintedIconTile/TintedIconTile';
import { type IconComponent } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

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
  const theme = useTheme();

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
