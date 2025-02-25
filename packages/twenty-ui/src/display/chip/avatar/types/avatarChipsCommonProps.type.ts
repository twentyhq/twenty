import { AvatarChipsLeftComponentProps } from '@ui/display/chip/avatar/components/AvatarChipLeftComponent';
import { AvatarChipVariant } from '@ui/display/chip/avatar/types/avatarChipsVariant.type';
import { ChipSize } from '@ui/display/chip/components/Chip';

export type AvatarChipsCommonProps = {
  variant?: AvatarChipVariant;
  size?: ChipSize;
  className?: string;
  clickable?: boolean;
  maxWidth?: number;
} & AvatarChipsLeftComponentProps;
