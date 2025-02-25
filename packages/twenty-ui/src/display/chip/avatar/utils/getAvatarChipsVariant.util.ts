import { AvatarChipsCommonProps } from '@ui/display/chip/avatar/types/avatarChipsCommonProps.type';
import { AvatarChipVariant } from '@ui/display/chip/avatar/types/avatarChipsVariant.type';
import { ChipVariant } from '@ui/display/chip/components/Chip';

type GetAvatarChipsVariantArgs = Pick<
  AvatarChipsCommonProps,
  'clickable' | 'variant'
>;
export const getAvatarChipsVariant = ({
  clickable = false,
  variant,
}: GetAvatarChipsVariantArgs) => {
  if (!clickable) {
    return ChipVariant.Transparent;
  }
  /// Hard to understand
  if (variant === AvatarChipVariant.Regular) {
    //Regular but Highlighted -> missleading
    return ChipVariant.Highlighted;
  }

  return ChipVariant.Regular;
  ///
};
