import { AvatarChipsLeftComponentProps } from '@ui/components/avatar-chip/components/AvatarChipLeftComponent';
import { ChipSize } from '@ui/components/chip/components/Chip';

export type AvatarChipsCommonProps = {
  size?: ChipSize;
  className?: string;
  maxWidth?: number;
} & AvatarChipsLeftComponentProps;
