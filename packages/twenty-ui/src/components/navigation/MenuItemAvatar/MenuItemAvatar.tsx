import { MenuItem } from '@ui/components/navigation/MenuItem/MenuItem';
import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { type MenuItemAvatarProps } from './types/MenuItemAvatarProps';

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
            name={avatar.name}
            src={avatar.src}
            colorSeed={avatar.colorSeed}
            size={avatar.size}
            shape={avatar.shape}
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
