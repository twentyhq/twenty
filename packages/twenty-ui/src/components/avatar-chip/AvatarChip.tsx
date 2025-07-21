import { AvatarChipsLeftComponent } from '@ui/components/avatar-chip/internal/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/components/avatar-chip/types/AvatarChipsCommonProps.type';
import { Chip, ChipVariant } from '@ui/components/chip/Chip';

export type AvatarChipProps = AvatarChipsCommonProps;

export const AvatarChip = ({
  name,
  LeftIcon,
  LeftIconColor,
  LeftIconBackgroundColor,
  rightComponent,
  leftComponent,
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
      leftComponent ?? (
        <AvatarChipsLeftComponent
          name={name}
          LeftIcon={LeftIcon}
          LeftIconColor={LeftIconColor}
          LeftIconBackgroundColor={LeftIconBackgroundColor}
          avatarType={avatarType}
          avatarUrl={avatarUrl}
          isIconInverted={isIconInverted}
          placeholderColorSeed={placeholderColorSeed}
        />
      )
    }
    rightComponent={rightComponent}
    clickable={false}
    className={className}
    maxWidth={maxWidth}
  />
);
