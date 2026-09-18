import { MenuItemLeftContent } from '@ui/components/MenuItem/parts/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemRightContent,
} from '@ui/components/MenuItem/parts/StyledMenuItemBase';
import { type MenuItemDraggableProps } from './types/MenuItemDraggableProps';

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
