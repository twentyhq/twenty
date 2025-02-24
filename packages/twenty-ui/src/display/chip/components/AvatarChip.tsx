import { Chip } from '@ui/display/chip/components/Chip';
import {
  AvatarChipsCommonProps,
  useGetAvatarChipLeftComponentAndVariant,
} from '@ui/display/chip/hooks/useGetAvatarChipLeftComponentAndVariant';

export type AvatarChipProps = AvatarChipsCommonProps;
export const AvatarChip = (props: AvatarChipProps) => {
  const { getLeftComponent, variant } =
    useGetAvatarChipLeftComponentAndVariant(props);
  const { size, clickable, className, maxWidth, name } = props;

  return (
    <Chip
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
