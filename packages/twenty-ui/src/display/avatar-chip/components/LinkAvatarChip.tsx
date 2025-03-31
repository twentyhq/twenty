import { ChipVariant } from '@ui/components/chip/Chip';
import { LinkChip, LinkChipProps } from '@ui/components/chip/LinkChip';
import { AvatarChipsLeftComponent } from '@ui/display/avatar-chip/components/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/display/avatar-chip/types/AvatarChipsCommonProps.type';
import { AvatarChipVariant } from '@ui/display/avatar-chip/types/AvatarChipsVariant.type';

export type LinkAvatarChipProps = Omit<AvatarChipsCommonProps, 'clickable'> & {
  to: string;
  onClick?: LinkChipProps['onClick'];
  variant?: AvatarChipVariant;
  isLabelHidden?: boolean;
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
  isLabelHidden,
}: LinkAvatarChipProps) => (
  <LinkChip
    to={to}
    onClick={onClick}
    label={name}
    isLabelHidden={isLabelHidden}
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
