import { LinkChip } from '@ui/display/chip/components/LinkChip';
import {
  AvatarChipsCommonProps,
  useGetAvatarLeftComponentAndVariant,
} from '@ui/display/chip/hooks/useGetAvatarLeftComponentAndVariant';

export type LinkAvatarChipProps = AvatarChipsCommonProps & {
  to: string;
  onClick?: () => void;
};

export const LinkAvatarChip = ({
  to,
  onClick,
  ...commonProps
}: LinkAvatarChipProps) => {
  const { getLeftComponent, variant } =
    useGetAvatarLeftComponentAndVariant(commonProps);

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
