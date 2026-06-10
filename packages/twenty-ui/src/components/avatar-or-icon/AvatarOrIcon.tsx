import { Avatar } from '@ui/display/avatar/components/Avatar';
import { type AvatarType } from '@ui/display/avatar/types/AvatarType';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';
import { type Nullable } from '@ui/utilities';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
  const { theme } = useContext(ThemeContext);

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

  if (isIconInverted || isDefined(IconBackgroundColor)) {
    return (
      <div
        className={styles.wrapper}
        data-clickable={isClickable || undefined}
        onClick={onClick}
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
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.wrapper}
      data-clickable={isClickable || undefined}
      onClick={onClick}
    >
      <Icon
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={IconColor || 'currentColor'}
      />
    </div>
  );
};
