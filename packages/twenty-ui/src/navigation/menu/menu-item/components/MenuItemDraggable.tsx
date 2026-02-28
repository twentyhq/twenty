import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '../internals/components/StyledMenuItemBase';
import { type MenuItemAccent } from '../types/MenuItemAccent';

import { type IconComponent } from '@ui/display';
import { LightIconButtonGroup } from '@ui/input';
import { ThemeContext } from '@ui/theme';
import { type ReactNode, useContext } from 'react';
import { type MenuItemDraggableGripMode } from '../types/MenuItemDraggableGripMode';
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
  isDragDisabled = false,
  className,
  isIconDisplayedOnHoverOnly = true,
  gripMode = 'never',
}: MenuItemDraggableProps) => {
  const { theme } = useContext(ThemeContext);

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
      theme={theme}
    >
      <MenuItemLeftContent
        LeftIcon={LeftIcon}
        text={text}
        withIconContainer={withIconContainer}
        disabled={isDragDisabled}
        gripMode={gripMode}
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
