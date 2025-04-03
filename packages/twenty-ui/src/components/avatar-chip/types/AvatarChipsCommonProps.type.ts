import { AvatarChipsLeftComponentProps } from '@ui/components/avatar-chip/AvatarChipLeftComponent';
import { ChipSize } from '@ui/components/chip/Chip';

export type AvatarChipsCommonProps = {
  size?: ChipSize;
  className?: string;
  maxWidth?: number;
} & AvatarChipsLeftComponentProps;
