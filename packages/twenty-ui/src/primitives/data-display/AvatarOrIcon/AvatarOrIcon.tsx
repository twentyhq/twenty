import { isNonEmptyString } from '@sniptt/guards';

import { handleClickableElementKeyDown } from '@ui/primitives/accessibility/utils/handleClickableElementKeyDown';
import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { useTheme } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './AvatarOrIcon.module.scss';
import { type AvatarOrIconProps } from './types/AvatarOrIconProps';

export const AvatarOrIcon = ({
  Icon,
  colorSeed,
  shape,
  src,
  name,
  isIconInverted = false,
  IconColor,
  IconBackgroundColor,
  onClick,
}: AvatarOrIconProps) => {
  const theme = useTheme();

  if (!isDefined(Icon)) {
    return (
      <Avatar
        src={src}
        colorSeed={colorSeed}
        name={name}
        size="sm"
        shape={shape ?? undefined}
        onClick={onClick}
      />
    );
  }

  const accessibleLabel = isNonEmptyString(name) ? name : 'Avatar';

  const iconContent =
    isIconInverted || isDefined(IconBackgroundColor) ? (
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
    ) : (
      <Icon
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
        color={IconColor || 'currentColor'}
        aria-hidden
      />
    );

  if (isDefined(onClick)) {
    return (
      <div
        className={styles.wrapper}
        data-clickable={true}
        role="button"
        tabIndex={0}
        aria-label={accessibleLabel}
        onClick={onClick}
        onKeyDown={handleClickableElementKeyDown}
      >
        {iconContent}
      </div>
    );
  }

  return <div className={styles.wrapper}>{iconContent}</div>;
};
