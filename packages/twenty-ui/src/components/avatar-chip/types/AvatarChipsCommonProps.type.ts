import { AvatarChipsLeftComponentProps } from '@ui/components/avatar-chip/internal/AvatarChipLeftComponent';
import { ChipSize, ChipVariant } from '@ui/components/chip/Chip';

export type AvatarChipsCommonProps = {
  size?: ChipSize;
  className?: string;
  maxWidth?: number;
  variant?: ChipVariant;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
} & AvatarChipsLeftComponentProps;
