import { IconCopy } from '@tabler/icons-react';

import {
  TABLE_PAGE_COLORS,
  TABLE_PAGE_TABLER_STROKE,
} from './table-page-theme';

export function CopyMini({
  color = TABLE_PAGE_COLORS.textSecondary,
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <IconCopy
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}
