import { IconPencil } from '@tabler/icons-react';

import {
  TABLE_PAGE_COLORS,
  TABLE_PAGE_TABLER_STROKE,
} from './table-page-theme';

export function PencilMini({
  color = TABLE_PAGE_COLORS.textSecondary,
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <IconPencil
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}
