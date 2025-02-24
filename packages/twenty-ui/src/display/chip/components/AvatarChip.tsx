import { Chip } from '@ui/display/chip/components/Chip';
import {
  AvatarChipsCommonProps,
  useGetAvatarLeftComponentAndVariant,
} from '@ui/display/chip/hooks/useGetAvatarLeftComponentAndVariant';

export type AvatarChipProps = AvatarChipsCommonProps;
export const AvatarChip = (props: AvatarChipProps) => {
  const { getLeftComponent, variant } =
    useGetAvatarLeftComponentAndVariant(props);
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
