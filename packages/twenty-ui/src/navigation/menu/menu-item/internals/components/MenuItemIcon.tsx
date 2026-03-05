import { type IconComponent } from '@ui/display';
import { MenuItemIconBoxContainer } from './MenuItemIconBoxContainer';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

export type MenuItemIconProps = {
  Icon: IconComponent | null | undefined;
  withContainer?: boolean;
};

export const MenuItemIcon = ({
  Icon,
  withContainer = false,
}: MenuItemIconProps) => {
  if (!Icon) {
    return null;
  }

  const iconElement = (
    <Icon
      size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
      stroke={resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.sm)}
    />
  );

  if (withContainer) {
    return <MenuItemIconBoxContainer>{iconElement}</MenuItemIconBoxContainer>;
  }

  return iconElement;
};
