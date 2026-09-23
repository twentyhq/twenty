import { IconChevronRight } from '@ui/icon';
import { type MouseEvent } from 'react';
import { type MenuItemProps } from './types/MenuItemProps';

import { MenuItemLeftContent } from '@ui/components/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemRightContent,
} from '@ui/components/navigation/MenuItem/parts/StyledMenuItemBase';
import { MenuItemHotKeys } from '@ui/primitives/navigation/ListItem/internal/MenuItemHotKeys/MenuItemHotKeys';
import { useTheme } from '@ui/theme-constants';
import { clsx } from 'clsx';

import styles from './MenuItem.module.scss';

export const MenuItem = ({
  accent = 'default',
  className,
  withIconContainer = false,
  withIconContainerBackground = true,
  iconButtons,
  isIconDisplayedOnHoverOnly = true,
  LeftIcon,
  iconThemeColor,
  LeftComponent,
  RightIcon,
  RightComponent,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  contextualTextPosition = 'left',
  contextualText,
  hasSubMenu = false,
  disabled = false,
  focused = false,
  selected = false,
  hotKeys,
  isSubMenuOpened = false,
}: MenuItemProps) => {
  const theme = useTheme();
  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={disabled ? undefined : handleMenuItemClick}
      disabled={disabled}
      className={className}
      accent={accent}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      focused={focused || selected}
    >
      <MenuItemLeftContent
        LeftIcon={LeftIcon ?? undefined}
        iconThemeColor={iconThemeColor}
        LeftComponent={LeftComponent}
        withIconContainer={withIconContainer}
        withIconContainerBackground={withIconContainerBackground}
        text={text}
        contextualText={contextualText}
        contextualTextPosition={contextualTextPosition}
        disabled={disabled}
      />

      <StyledMenuItemRightContent>
        {iconButtons && (
          <StyledMenuItemRightContent className="hoverable-buttons">
            {iconButtons}
          </StyledMenuItemRightContent>
        )}
        {hotKeys && <MenuItemHotKeys hotKeys={hotKeys} />}
        {RightIcon && (
          <RightIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        {RightComponent}
        {hasSubMenu && (
          <div
            className={clsx(
              styles.subMenuIcon,
              isSubMenuOpened && styles.subMenuIconOpened,
            )}
            style={{ visibility: disabled ? 'hidden' : 'visible' }}
          >
            <IconChevronRight
              size={theme.icon.size.sm}
              color={theme.font.color.light}
            />
          </div>
        )}
      </StyledMenuItemRightContent>
    </StyledHoverableMenuItemBase>
  );
};
