import { isNonEmptyString, isNull, isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useState } from 'react';

import { handleClickableElementKeyDown } from '@ui/accessibility/utils/handleClickableElementKeyDown';
import { AvatarImageLoadErrorEffect } from '@ui/data-display/Avatar/components/AvatarImageLoadErrorEffect';
import { type AvatarSize } from '@ui/data-display/Avatar/types/AvatarSize';
import { type AvatarType } from '@ui/data-display/Avatar/types/AvatarType';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';
import { stringToThemeColorP3String } from '@ui/utilities';
import { type Nullable } from '@ui/utilities/types/Nullable';

import styles from './Avatar.module.scss';

export type AvatarProps = {
  avatarUrl?: string | null;
  className?: string;
  size?: AvatarSize;
  placeholder: string | undefined;
  placeholderColorSeed?: string;
  Icon?: IconComponent;
  iconColor?: string;
  type?: Nullable<AvatarType>;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  pulsing?: boolean;
  onClick?: () => void;
};

export const Avatar = ({
  avatarUrl,
  className,
  size = 'md',
  placeholder,
  placeholderColorSeed = placeholder,
  Icon,
  iconColor,
  onClick,
  type = 'squared',
  color,
  backgroundColor,
  borderColor,
  pulsing = false,
}: AvatarProps) => {
  const theme = useTheme();

  const [erroredAvatarImageURI, setErroredAvatarImageURI] = useState<
    string | null
  >(null);

  const avatarImageURI = isNonEmptyString(avatarUrl) ? avatarUrl : null;

  const avatarImageFailedToLoad =
    isNonEmptyString(avatarImageURI) &&
    erroredAvatarImageURI === avatarImageURI;

  const placeholderFirstChar = placeholder?.trim()?.charAt(0);
  const isPlaceholderFirstCharEmpty =
    !placeholderFirstChar || placeholderFirstChar === '';
  const placeholderChar = placeholderFirstChar?.toUpperCase() || '-';

  const showPlaceholder = isNull(avatarImageURI) || avatarImageFailedToLoad;

  const fixedColor = isPlaceholderFirstCharEmpty
    ? theme.font.color.tertiary
    : (color ??
      stringToThemeColorP3String({
        string: placeholderColorSeed ?? '',
        variant: 12,
        theme,
      }));
  const fixedBackgroundColor = isPlaceholderFirstCharEmpty
    ? theme.background.transparent.light
    : (backgroundColor ??
      stringToThemeColorP3String({
        string: placeholderColorSeed ?? '',
        variant: type === 'app' ? 5 : 4,
        theme,
      }));

  const fixedBorderColor =
    type === 'app'
      ? (borderColor ??
        (isPlaceholderFirstCharEmpty
          ? undefined
          : stringToThemeColorP3String({
              string: placeholderColorSeed ?? '',
              variant: 6,
              theme,
            })))
      : undefined;

  const showBackgroundColor = showPlaceholder;

  const showBorderColor = showPlaceholder;

  const appliedBorderColor = showBorderColor ? fixedBorderColor : undefined;

  const avatarStyle = {
    '--avatar-color': fixedColor,
    '--avatar-background': Icon
      ? 'inherit'
      : showBackgroundColor
        ? fixedBackgroundColor
        : 'none',
    ...(type === 'app' && appliedBorderColor
      ? { '--avatar-border': `1px solid ${appliedBorderColor}` }
      : {}),
  } as React.CSSProperties;

  return (
    <div
      className={clsx(
        styles.root,
        styles[size],
        pulsing && styles.pulsing,
        className,
      )}
      data-type={type ?? undefined}
      data-clickable={!isUndefined(onClick) ? true : undefined}
      role={!isUndefined(onClick) ? 'button' : undefined}
      tabIndex={!isUndefined(onClick) ? 0 : undefined}
      aria-label={
        !isUndefined(onClick)
          ? isNonEmptyString(placeholder)
            ? placeholder
            : 'Avatar'
          : undefined
      }
      onClick={onClick}
      onKeyDown={handleClickableElementKeyDown}
      style={avatarStyle}
    >
      {isNonEmptyString(avatarImageURI) && (
        <AvatarImageLoadErrorEffect
          avatarImageURI={avatarImageURI}
          onImageLoadError={setErroredAvatarImageURI}
        />
      )}
      {Icon ? (
        <Icon
          color={iconColor ? iconColor : 'currentColor'}
          size={theme.icon.size.xl}
        />
      ) : showPlaceholder ? (
        <span className={styles.placeholderChar}>{placeholderChar}</span>
      ) : (
        <div
          className={styles.image}
          style={{
            backgroundImage: `url("${CSS.escape(avatarImageURI)}")`,
          }}
        />
      )}
    </div>
  );
};
