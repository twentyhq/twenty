import {
  LinkChip,
  LinkChipOnClick,
} from '@ui/display/chip/components/LinkChip';
import {
  AvatarChipsCommonProps,
  useGetAvatarChipLeftComponentAndVariant,
} from '@ui/display/chip/hooks/useGetAvatarChipLeftComponentAndVariant';

export type LinkAvatarChipProps = AvatarChipsCommonProps & {
  to: string;
  onClick?: LinkChipOnClick;
};

export const LinkAvatarChip = ({
  to,
  onClick,
  ...commonProps
}: LinkAvatarChipProps) => {
  const { getLeftComponent, variant } =
    useGetAvatarChipLeftComponentAndVariant(commonProps);

  const { size, clickable, className, maxWidth, name } = commonProps;
  return (
    <LinkChip
      to={to}
      onClick={onClick}
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
