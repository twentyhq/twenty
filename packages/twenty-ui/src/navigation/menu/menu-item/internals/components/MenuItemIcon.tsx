import { type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme-constants';
import { useContext } from 'react';
import { MenuItemIconBoxContainer } from './MenuItemIconBoxContainer';

export type MenuItemIconProps = {
  Icon: IconComponent | null | undefined;
  withContainer?: boolean;
  withContainerBackground?: boolean;
};

export const MenuItemIcon = ({
  Icon,
  withContainer = false,
  withContainerBackground = true,
}: MenuItemIconProps) => {
  const { theme } = useContext(ThemeContext);

  if (!Icon) {
    return null;
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
