import { Chip } from '@ui/display/chip/components/Chip';
import {
  AvatarChipsCommonProps,
  useGetAvatarChipsBuilder,
} from '@ui/display/chip/hooks/useGetAvatarChipBuilder';

export type AvatarChipProps = AvatarChipsCommonProps;
export const AvatarChip = (props: AvatarChipProps) => {
  const { getLeftComponent, variant } = useGetAvatarChipsBuilder(props);
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
