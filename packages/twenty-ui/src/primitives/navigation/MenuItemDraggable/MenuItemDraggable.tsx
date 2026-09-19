import { MenuItemLeftContent } from '@ui/primitives/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemRightContent,
} from '@ui/primitives/navigation/MenuItem/parts/StyledMenuItemBase';
import { type MenuItemAccent } from '@ui/primitives/navigation/MenuItem/types/MenuItemAccent';

import { type IconComponent } from '@ui/icon';
import { type ReactNode } from 'react';
import { type MenuItemDraggableGripMode } from '@ui/primitives/navigation/MenuItem/types/MenuItemDraggableGripMode';

export type MenuItemDraggableProps = {
  LeftIcon?: IconComponent | undefined;
  withIconContainer?: boolean;
  accent?: MenuItemAccent;
  iconButtons?: ReactNode;
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
      {iconButtons && (
        <StyledMenuItemRightContent className="hoverable-buttons">
          {iconButtons}
        </StyledMenuItemRightContent>
      )}
    </StyledHoverableMenuItemBase>
  );
};
