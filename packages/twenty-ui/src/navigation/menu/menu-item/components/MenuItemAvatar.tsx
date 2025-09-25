import { useTheme } from '@emotion/react';
import { Avatar, type AvatarProps, IconChevronRight } from '@ui/display';
import { LightIconButtonGroup } from '@ui/input';
import { type MenuItemIconButton } from '@ui/navigation/menu/menu-item/components/MenuItem';
import { MenuItemLeftContent } from '@ui/navigation/menu/menu-item/internals/components/MenuItemLeftContent';
import { type MouseEvent, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';
import { type MenuItemAccent } from '../types/MenuItemAccent';

export type MenuItemAvatarProps = {
  accent?: MenuItemAccent;
  className?: string;
  iconButtons?: MenuItemIconButton[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  avatar?: Pick<
    AvatarProps,
    'avatarUrl' | 'placeholderColorSeed' | 'placeholder' | 'size' | 'type'
  > | null;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text: string;
  hasSubMenu?: boolean;
  contextualText?: ReactNode;
};

// TODO: merge with MenuItem
export const MenuItemAvatar = ({
  accent = 'default',
  className,
  iconButtons,
  isIconDisplayedOnHoverOnly = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  avatar,
  hasSubMenu = false,
  text,
  contextualText,
}: MenuItemAvatarProps) => {
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
      onClick={handleMenuItemClick}
      className={className}
      accent={accent}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent
          LeftIcon={undefined}
          LeftComponent={
            isDefined(avatar) ? (
              <Avatar
                placeholder={avatar.placeholder}
                avatarUrl={avatar.avatarUrl}
                placeholderColorSeed={avatar.placeholderColorSeed}
                size={avatar.size}
                type={avatar.type}
              />
            ) : undefined
          }
          text={text}
          contextualText={contextualText}
        />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        {showIconButtons && (
          <LightIconButtonGroup iconButtons={iconButtons} size="small" />
        )}
      </div>
      {hasSubMenu && (
        <IconChevronRight
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      )}
    </StyledHoverableMenuItemBase>
  );
};
