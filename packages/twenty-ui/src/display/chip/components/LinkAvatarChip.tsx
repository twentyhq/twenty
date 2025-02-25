import { LinkChip, LinkChipProps } from '@ui/display/chip/components/LinkChip';
import {
  AvatarChipsCommonProps,
  useGetAvatarChipLeftComponentAndVariant,
} from '@ui/display/chip/hooks/useGetAvatarChipLeftComponentAndVariant';

export type LinkAvatarChipProps = Omit<AvatarChipsCommonProps, 'clickable'> & {
  to: string;
  onClick?: LinkChipProps['onClick'];
};

export const LinkAvatarChip = ({
  to,
  onClick,
  ...commonProps
}: LinkAvatarChipProps) => {
  const { getLeftComponent, variant } =
    useGetAvatarChipLeftComponentAndVariant(commonProps);

  const { size, className, maxWidth, name } = commonProps;
  return (
    <LinkChip
      to={to}
      onClick={onClick}
      label={name}
      variant={variant}
      size={size}
      leftComponent={getLeftComponent}
      className={className}
      maxWidth={maxWidth}
    />
  );
};
