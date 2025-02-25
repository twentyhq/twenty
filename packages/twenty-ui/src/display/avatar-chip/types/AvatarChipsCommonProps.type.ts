import { AvatarChipsLeftComponentProps } from '@ui/display/avatar-chip/components/AvatarChipLeftComponent';
import { AvatarChipVariant } from '@ui/display/avatar-chip/types/AvatarChipsVariant.type';
import { ChipSize } from '@ui/display/chip/components/Chip';

export type AvatarChipsCommonProps = {
  variant?: AvatarChipVariant;
  size?: ChipSize;
  className?: string;
  clickable?: boolean;
  maxWidth?: number;
} & AvatarChipsLeftComponentProps;
