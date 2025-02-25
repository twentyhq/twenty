import { AvatarChipsLeftComponent } from '@ui/display/chip/avatar/components/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/display/chip/avatar/types/avatarChipsCommonProps.type';
import { getAvatarChipsVariant } from '@ui/display/chip/avatar/utils/getAvatarChipsVariant.util';
import { Chip } from '@ui/display/chip/components/Chip';

export type AvatarChipProps = AvatarChipsCommonProps;
export const AvatarChip = ({
  name,
  LeftIcon,
  LeftIconColor,
  avatarType,
  avatarUrl,
  className,
  isIconInverted,
  maxWidth,
  placeholderColorSeed,
  size,
  clickable,
  variant,
}: AvatarChipProps) => (
  <Chip
    label={name}
    variant={getAvatarChipsVariant({
      variant,
      clickable,
    })}
    size={size}
    leftComponent={() => (
      <AvatarChipsLeftComponent
        name={name}
        LeftIcon={LeftIcon}
        LeftIconColor={LeftIconColor}
        avatarType={avatarType}
        avatarUrl={avatarUrl}
        isIconInverted={isIconInverted}
        placeholderColorSeed={placeholderColorSeed}
      />
    )}
    clickable={clickable}
    className={className}
    maxWidth={maxWidth}
  />
);
