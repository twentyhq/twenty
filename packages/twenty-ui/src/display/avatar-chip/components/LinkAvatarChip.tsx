import { AvatarChipsLeftComponent } from '@ui/display/avatar-chip/components/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/display/avatar-chip/types/AvatarChipsCommonProps.type';
import { AvatarChipVariant } from '@ui/display/avatar-chip/types/AvatarChipsVariant.type';
import { ChipVariant } from '@ui/display/chip/components/Chip';
import { LinkChip, LinkChipProps } from '@ui/display/chip/components/LinkChip';

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
