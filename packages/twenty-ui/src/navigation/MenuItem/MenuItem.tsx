import { IconChevronRight, type IconComponent } from '@ui/icon';
import { type LightIconButtonProps } from '@ui/input/LightIconButton/LightIconButton';
import { LightIconButtonGroup } from '@ui/input/LightIconButtonGroup/LightIconButtonGroup';
import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { MenuItemHotKeys } from '@ui/navigation/MenuItemHotKeys/MenuItemHotKeys';
import { type ThemeColor } from '@ui/theme';
import { useTheme } from '@ui/theme-constants';
import { clsx } from 'clsx';
import { type Nullable } from '@ui/utilities/types/Nullable';
import { MenuItemLeftContent } from '@ui/navigation/MenuItem/parts/MenuItemLeftContent';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
  StyledMenuItemRightContent,
} from '@ui/navigation/MenuItem/parts/StyledMenuItemBase';
import { type MenuItemAccent } from '@ui/navigation/MenuItem/types/MenuItemAccent';

import styles from './MenuItem.module.scss';

export {
  MenuItemLeftContent,
  StyledHoverableMenuItemBase,
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
};

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: MouseEvent<any>) => void;
  ariaLabel?: string;
  dataTestId?: string;
};

export type MenuItemProps = {
  accent?: MenuItemAccent;
  className?: string;
  withIconContainer?: boolean;
  withIconContainerBackground?: boolean;
  iconButtons?: MenuItemIconButton[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  LeftIcon?: IconComponent | null;
  iconThemeColor?: ThemeColor | null;
  LeftComponent?: ReactNode;
  RightIcon?: IconComponent | null;
  RightComponent?: ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  disabled?: boolean;
  text: ReactNode;
  contextualTextPosition?: 'left' | 'right';
  contextualText?: ReactNode;
  hasSubMenu?: boolean;
  focused?: boolean;
  selected?: boolean;
  hotKeys?: Nullable<string[]>;
  isSubMenuOpened?: boolean;
};

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
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

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
          <div className="hoverable-buttons">
            {showIconButtons && (
              <LightIconButtonGroup iconButtons={iconButtons} size="small" />
            )}
          </div>
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
