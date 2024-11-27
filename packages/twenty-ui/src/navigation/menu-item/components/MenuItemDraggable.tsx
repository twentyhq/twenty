import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

import { IconComponent } from '@ui/display';
import { LightIconButtonGroup } from '@ui/input';
import { ReactNode } from 'react';
import { MenuItemIconButton } from './MenuItem';

export type MenuItemDraggableProps = {
  LeftIcon?: IconComponent | undefined;
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
      ? 'not-allowed'
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
        isDisabled={isDragDisabled}
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
