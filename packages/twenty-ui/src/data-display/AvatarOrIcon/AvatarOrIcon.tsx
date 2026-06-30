import { isNonEmptyString } from '@sniptt/guards';

import { handleClickableElementKeyDown } from '@ui/accessibility/utils/handleClickableElementKeyDown';
import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { type AvatarType } from '@ui/data-display/Avatar/types/AvatarType';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';
import { type Nullable } from '@ui/utilities';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './AvatarOrIcon.module.scss';

export type AvatarOrIconProps = {
  placeholder?: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  Icon?: IconComponent;
  IconColor?: string;
  IconBackgroundColor?: string;
  isIconInverted?: boolean;
  placeholderColorSeed?: string;
  onClick?: () => void;
};

export const AvatarOrIcon = ({
  Icon,
  placeholderColorSeed,
  avatarType,
  avatarUrl,
  placeholder,
  isIconInverted = false,
  IconColor,
  IconBackgroundColor,
  onClick,
}: AvatarOrIconProps) => {
  const theme = useTheme();

  if (!isDefined(Icon)) {
    return (
      <Avatar
        avatarUrl={avatarUrl}
        placeholderColorSeed={placeholderColorSeed}
        placeholder={placeholder}
        size="sm"
        type={avatarType}
        onClick={onClick}
      />
    );
  }

  const isClickable = isDefined(onClick);
  const accessibleLabel = isNonEmptyString(placeholder)
    ? placeholder
    : 'Avatar';

  if (isIconInverted || isDefined(IconBackgroundColor)) {
    return (
      <div
        className={styles.wrapper}
        data-clickable={isClickable || undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isClickable ? accessibleLabel : undefined}
        onClick={onClick}
        onKeyDown={handleClickableElementKeyDown}
      >
        <div
          className={styles.iconWithBackgroundContainer}
          style={
            isDefined(IconBackgroundColor)
              ? ({
                  '--avatar-or-icon-background': IconBackgroundColor,
                } as React.CSSProperties)
              : undefined
          }
        >
          <Icon
            color={theme.font.color.inverted}
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
            aria-hidden
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.wrapper}
      data-clickable={isClickable || undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? accessibleLabel : undefined}
      onClick={onClick}
      onKeyDown={handleClickableElementKeyDown}
    >
      <Icon
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={IconColor || 'currentColor'}
        aria-hidden
      />
    </div>
  );
};
