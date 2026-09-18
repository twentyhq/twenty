import { MenuItemLeftContent } from '@ui/components/MenuItem/parts/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '@ui/components/MenuItem/parts/StyledMenuItemBase';
import { type MenuItemDraggableProps } from './types/MenuItemDraggableProps';

import { LightIconButtonGroup } from '@ui/components/LightIconButtonGroup/LightIconButtonGroup';

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
        <LightIconButtonGroup
          className="hoverable-buttons"
          iconButtons={iconButtons}
        />
      )}
    </StyledHoverableMenuItemBase>
  );
};
