import { AvatarChipsLeftComponent } from '@ui/components/avatar-chip/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/components/avatar-chip/types/AvatarChipsCommonProps.type';
import { Chip, ChipVariant } from '@ui/components/chip/Chip';

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
  variant = ChipVariant.Transparent,
}: AvatarChipProps) => (
  <Chip
    label={name}
    variant={variant}
    size={size}
    leftComponent={
      <AvatarChipsLeftComponent
        name={name}
        LeftIcon={LeftIcon}
        LeftIconColor={LeftIconColor}
        avatarType={avatarType}
        avatarUrl={avatarUrl}
        isIconInverted={isIconInverted}
        placeholderColorSeed={placeholderColorSeed}
      />
    }
    clickable={false}
    className={className}
    maxWidth={maxWidth}
  />
);
