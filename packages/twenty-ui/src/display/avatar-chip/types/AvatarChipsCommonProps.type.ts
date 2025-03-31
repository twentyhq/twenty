import { ChipSize } from '@ui/components/chip/Chip';
import { AvatarChipsLeftComponentProps } from '@ui/display/avatar-chip/components/AvatarChipLeftComponent';

export type AvatarChipsCommonProps = {
  size?: ChipSize;
  className?: string;
  maxWidth?: number;
} & AvatarChipsLeftComponentProps;
