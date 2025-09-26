import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '../internals/components/StyledMenuItemBase';
import { type MenuItemAccent } from '../types/MenuItemAccent';

import { type IconComponent } from '@ui/display';
import { LightIconButtonGroup } from '@ui/input';
import { type ReactNode } from 'react';
import { type MenuItemIconButton } from './MenuItem';

export type MenuItemDraggableProps = {
  LeftIcon?: IconComponent | undefined;
  withIconContainer?: boolean;
  accent?: MenuItemAccent;
  iconButtons?: MenuItemIconButton[];
  isTooltipOpen?: boolean;
  onClick?: () => void;
  text: ReactNode;
  className?: string;
  isIconDisplayedOnHoverOnly?: boolean;
  showGrip?: boolean;
  isDragDisabled?: boolean;
  isHoverDisabled?: boolean;
};

export const MenuItemDraggable = ({
  LeftIcon,
  withIconContainer = false,
  accent = 'default',
  iconButtons,
  onClick,
  text,
  isDragDisabled = false,
  className,
  isIconDisplayedOnHoverOnly = true,
  showGrip = false,
}: MenuItemDraggableProps) => {
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  const cursorType = showGrip
    ? isDragDisabled
      ? 'default'
      : 'drag'
    : 'default';

  return (
    <StyledHoverableMenuItemBase
      onClick={onClick}
      accent={accent}
      className={className}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      cursor={cursorType}
    >
      <MenuItemLeftContent
        LeftIcon={LeftIcon}
        text={text}
        withIconContainer={withIconContainer}
        disabled={isDragDisabled}
        showGrip={showGrip}
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
