import {
  IconBrandLinkedin,
  IconBuildingFactory2,
  IconCalendarEvent,
  IconCreativeCommonsSa,
  IconLink,
  IconMap2,
  IconMoneybag,
  IconTarget,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

import {
  TABLE_PAGE_COLORS,
  TABLE_PAGE_TABLER_STROKE,
} from './table-page-theme';

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
