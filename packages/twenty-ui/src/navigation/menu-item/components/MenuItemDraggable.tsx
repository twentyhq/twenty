import { IconComponent } from 'src/display';
import { LightIconButtonGroup } from 'src/input';
import { MenuItemLeftContent } from 'src/navigation/menu-item/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from 'src/navigation/menu-item/components/StyledMenuItemBase';

import { MenuItemAccent } from '../types/MenuItemAccent';

import { MenuItemIconButton } from './MenuItem';

export type MenuItemDraggableProps = {
  LeftIcon: IconComponent | undefined;
  accent?: MenuItemAccent;
  iconButtons?: MenuItemIconButton[];
  isTooltipOpen?: boolean;
  onClick?: () => void;
  text: string;
  isDragDisabled?: boolean;
  className?: string;
};
export const MenuItemDraggable = ({
  LeftIcon,
  accent = 'default',
  iconButtons,
  isTooltipOpen,
  onClick,
  text,
  isDragDisabled = false,
  className,
}: MenuItemDraggableProps) => {
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  return (
    <StyledHoverableMenuItemBase
      onClick={onClick}
      accent={accent}
      className={className}
      isMenuOpen={!!isTooltipOpen}
    >
      <MenuItemLeftContent
        LeftIcon={LeftIcon}
        text={text}
        showGrip={!isDragDisabled}
      />
      {showIconButtons && (
        <LightIconButtonGroup
          className="hoverable-buttons"
          iconButtons={iconButtons}
        />
      )}
    </StyledHoverableMenuItemBase>
  );
};
