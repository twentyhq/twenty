import { AvatarChipsLeftComponent } from '@ui/components/avatar-chip/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/components/avatar-chip/types/AvatarChipsCommonProps.type';
import { AvatarChipVariant } from '@ui/components/avatar-chip/types/AvatarChipsVariant.type';
import { ChipVariant } from '@ui/components/chip/Chip';
import {
  LinkChip,
  LinkChipProps,
} from '@ui/components/chip/LinkChip';

export type LinkAvatarChipProps = Omit<AvatarChipsCommonProps, 'clickable'> & {
  to: string;
  onClick?: LinkChipProps['onClick'];
  variant?: AvatarChipVariant;
};

export const LinkAvatarChip = ({
  to,
  onClick,
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
  variant,
}: LinkAvatarChipProps) => (
  <LinkChip
    to={to}
    onClick={onClick}
    label={name}
    variant={
      //Regular but Highlighted -> missleading
      variant === AvatarChipVariant.Regular
        ? ChipVariant.Highlighted
        : ChipVariant.Regular
    }
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
    className={className}
    maxWidth={maxWidth}
  />
);
