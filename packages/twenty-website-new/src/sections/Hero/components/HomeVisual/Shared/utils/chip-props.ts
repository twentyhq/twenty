import type { ReactNode } from 'react';

import type { ChipVariant } from './chip-variant';

export type ChipProps = {
  label: string;
  clickable?: boolean;
  isBold?: boolean;
  leftComponent?: ReactNode | null;
  className?: string;
  maxWidth?: number;
  onClick?: () => void;
  variant?: ChipVariant;
};
