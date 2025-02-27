import { AvatarChipsLeftComponentProps } from '@ui/display/avatar-chip/components/AvatarChipLeftComponent';
import { ChipSize } from '@ui/display/chip/components/Chip';

export type AvatarChipsCommonProps = {
  size?: ChipSize;
  className?: string;
  maxWidth?: number;
} & AvatarChipsLeftComponentProps;
