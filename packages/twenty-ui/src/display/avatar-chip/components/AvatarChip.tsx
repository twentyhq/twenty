import { Chip, ChipVariant } from '@ui/components/chip/Chip';
import { AvatarChipsLeftComponent } from '@ui/display/avatar-chip/components/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/display/avatar-chip/types/AvatarChipsCommonProps.type';

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
}: AvatarChipProps) => (
  <Chip
    label={name}
    variant={ChipVariant.Transparent}
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
    clickable={false}
    className={className}
    maxWidth={maxWidth}
  />
);
