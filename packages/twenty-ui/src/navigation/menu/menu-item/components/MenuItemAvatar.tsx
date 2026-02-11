import { Avatar, type AvatarProps } from '@ui/display';
import { type MenuItemIconButton, MenuItem } from '@ui/navigation/menu/menu-item/components/MenuItem';
import { type MouseEvent, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
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

export const MenuItemAvatar = ({
  accent = 'default',
  className,
  iconButtons,
  isIconDisplayedOnHoverOnly = true,
  isTooltipOpen,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  avatar,
  hasSubMenu = false,
  text,
  contextualText,
}: MenuItemAvatarProps) => {
  return (
    <MenuItem
      accent={accent}
      className={className}
      iconButtons={iconButtons}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      isTooltipOpen={isTooltipOpen}
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
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      testId={testId}
      text={text}
      contextualText={contextualText}
      hasSubMenu={hasSubMenu}
    />
  );
};
