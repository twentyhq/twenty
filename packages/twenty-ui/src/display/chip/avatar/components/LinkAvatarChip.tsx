import { AvatarChipsLeftComponent } from '@ui/display/chip/avatar/components/AvatarChipLeftComponent';
import { AvatarChipsCommonProps } from '@ui/display/chip/avatar/types/AvatarChipsCommonProps.type';
import { getAvatarChipsVariant } from '@ui/display/chip/avatar/utils/getAvatarChipsVariant.util';
import { LinkChip, LinkChipProps } from '@ui/display/chip/components/LinkChip';

export type LinkAvatarChipProps = Omit<AvatarChipsCommonProps, 'clickable'> & {
  to: string;
  onClick?: LinkChipProps['onClick'];
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
    variant={getAvatarChipsVariant({
      variant,
      clickable: true,
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
    className={className}
    maxWidth={maxWidth}
  />
);
