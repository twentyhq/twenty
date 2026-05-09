import { IconChevronDown } from '@tabler/icons-react';

import {
  TABLE_PAGE_COLORS,
  TABLE_PAGE_TABLER_STROKE,
} from './table-page-theme';

export function ChevronDownMini({
  color = TABLE_PAGE_COLORS.textTertiary,
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <IconChevronDown
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}
