import { MenuItemLeftContent } from '@ui/primitives/navigation/MenuItem/parts/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '@ui/primitives/navigation/MenuItem/parts/StyledMenuItemBase';
import { type MenuItemAccent } from '@ui/primitives/navigation/MenuItem/types/MenuItemAccent';

import { type IconComponent } from '@ui/icon';
import { MenuItemActions } from '@ui/primitives/navigation/MenuItem/internal/MenuItemActions';
import { type ReactNode } from 'react';
import { type MenuItemDraggableGripMode } from '@ui/primitives/navigation/MenuItem/types/MenuItemDraggableGripMode';
import { type MenuItemIconButton } from '@ui/primitives/navigation/MenuItem/types/MenuItemIconButton';

export type MenuItemDraggableProps = {
  LeftIcon?: IconComponent | undefined;
  withIconContainer?: boolean;
  accent?: MenuItemAccent;
  iconButtons?: MenuItemIconButton[];
  isTooltipOpen?: boolean;
  onClick?: () => void;
  text: ReactNode;
  contextualText?: ReactNode;
  className?: string;
  isIconDisplayedOnHoverOnly?: boolean;
  gripMode?: MenuItemDraggableGripMode;
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
  contextualText,
  isDragDisabled = false,
  className,
  isIconDisplayedOnHoverOnly = true,
  gripMode = 'never',
}: MenuItemDraggableProps) => {
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  const cursorType =
    gripMode !== 'never' ? (isDragDisabled ? 'default' : 'drag') : 'default';

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
        contextualText={contextualText}
        withIconContainer={withIconContainer}
        disabled={isDragDisabled}
        gripMode={gripMode}
      />
      {showIconButtons && (
        <MenuItemActions
          className="hoverable-buttons"
          iconButtons={iconButtons}
        />
      )}
    </StyledHoverableMenuItemBase>
  );
};
