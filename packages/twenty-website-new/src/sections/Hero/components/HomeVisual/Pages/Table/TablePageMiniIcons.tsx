import {
  IconBrandLinkedin,
  IconBuildingFactory2,
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconCreativeCommonsSa,
  IconLink,
  IconMap2,
  IconMoneybag,
  IconPencil,
  IconPlus,
  IconTarget,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

import {
  TABLE_PAGE_COLORS,
  TABLE_PAGE_TABLER_STROKE,
} from './table-page-theme';

type MiniIconProps = {
  color?: string;
  size?: number;
};

const HEADER_ICON_MAP: Record<string, typeof IconCalendarEvent> = {
  added: IconCalendarEvent,
  accountOwner: IconUserCircle,
  address: IconMap2,
  arr: IconMoneybag,
  createdBy: IconCreativeCommonsSa,
  employees: IconUsers,
  icp: IconTarget,
  industry: IconBuildingFactory2,
  linkedin: IconBrandLinkedin,
  mainContact: IconUser,
  opportunities: IconTargetArrow,
  url: IconLink,
};

export function PlusMini({
  color = TABLE_PAGE_COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconPlus
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}

export function CheckMini({
  color = TABLE_PAGE_COLORS.text,
  size = 12,
}: MiniIconProps) {
  return (
    <IconCheck
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}

export function CloseMini({
  color = TABLE_PAGE_COLORS.text,
  size = 12,
}: MiniIconProps) {
  return (
    <IconX
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}

export function PencilMini({
  color = TABLE_PAGE_COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconPencil
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}

export function CopyMini({
  color = TABLE_PAGE_COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconCopy
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}

export function ChevronDownMini({
  color = TABLE_PAGE_COLORS.textTertiary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconChevronDown
      aria-hidden
      color={color}
      size={size}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}

export function renderTableHeaderIcon(columnId: string): ReactNode {
  const Icon = HEADER_ICON_MAP[columnId] ?? IconCalendarEvent;

  return (
    <Icon
      aria-hidden
      color={TABLE_PAGE_COLORS.textTertiary}
      size={16}
      stroke={TABLE_PAGE_TABLER_STROKE}
    />
  );
}
