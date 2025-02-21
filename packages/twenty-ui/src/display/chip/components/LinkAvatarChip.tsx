import { LinkChip } from '@ui/display/chip/components/LinkChip';
import {
  AvatarChipsCommonProps,
  userGetAvatarChipsBuilder,
} from '@ui/display/chip/hooks/getAvatarChipBuilder';

export type LinkAvatarChipProps = AvatarChipsCommonProps & { to: string };

export const LinkAvatarChip = ({ to, ...commonProps }: LinkAvatarChipProps) => {
  const { getLeftComponent, variant } = userGetAvatarChipsBuilder(commonProps);

  const { size, clickable, className, maxWidth, name } = commonProps;
  return (
    <LinkChip
      to={to}
      label={name}
      variant={variant}
      size={size}
      leftComponent={getLeftComponent}
      clickable={clickable}
      className={className}
      maxWidth={maxWidth}
    />
  );
};
