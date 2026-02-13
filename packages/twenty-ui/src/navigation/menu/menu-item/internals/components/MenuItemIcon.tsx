import { useTheme } from '@emotion/react';

import { type IconComponent } from '@ui/display';
import { MenuItemIconBoxContainer } from './MenuItemIconBoxContainer';

export type MenuItemIconProps = {
  Icon: IconComponent | null | undefined;
  withContainer?: boolean;
};

export const MenuItemIcon = ({
  Icon,
  withContainer = false,
}: MenuItemIconProps) => {
  const theme = useTheme();

  if (!Icon) {
    return null;
  }

  const iconElement = (
    <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
  );

  if (withContainer) {
    return <MenuItemIconBoxContainer>{iconElement}</MenuItemIconBoxContainer>;
  }

  return iconElement;
};
