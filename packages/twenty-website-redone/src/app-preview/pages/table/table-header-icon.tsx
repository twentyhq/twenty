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
import { type ReactNode } from 'react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { PREVIEW_COLORS } from '../../preview-colors';

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
      color={PREVIEW_COLORS.textTertiary}
      size={16}
      stroke={APP_PREVIEW_THEME.icon.stroke.sm}
    />
  );
}
