import { type IconComponent } from '@ui/display';
import { useContext } from 'react';
import { ThemeContext } from '@ui/theme-constants';
import { MenuItemIconBoxContainer } from './MenuItemIconBoxContainer';

export type MenuItemIconProps = {
  Icon: IconComponent | null | undefined;
  withContainer?: boolean;
};

export const MenuItemIcon = ({
  Icon,
  withContainer = false,
}: MenuItemIconProps) => {
  const { theme } = useContext(ThemeContext);

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
