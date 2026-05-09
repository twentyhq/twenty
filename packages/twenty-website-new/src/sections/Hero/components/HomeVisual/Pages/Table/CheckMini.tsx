import { IconCheck } from '@tabler/icons-react';

import {
  TABLE_PAGE_COLORS,
  TABLE_PAGE_TABLER_STROKE,
} from './table-page-theme';

export function CheckMini({
  color = TABLE_PAGE_COLORS.text,
  size = 12,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <IconCheck
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}
