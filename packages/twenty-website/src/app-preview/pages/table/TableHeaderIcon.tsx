import {
  Icon123,
  IconArrowUpRight,
  IconBrandLinkedin,
  IconBriefcase,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCalendarClock,
  IconCalendarEvent,
  IconCategory,
  IconClock,
  IconCreativeCommonsSa,
  IconFlag,
  IconHistory,
  IconLayoutDashboard,
  IconLink,
  IconMail,
  IconMap,
  IconMapPin,
  IconMoneybag,
  IconNotes,
  IconPhone,
  IconPlanet,
  IconRepeat,
  IconRocket,
  IconRuler,
  IconSettingsAutomation,
  IconStatusChange,
  IconTag,
  IconTarget,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconVersions,
  IconWeight,
} from '@tabler/icons-react';
import { type ReactNode } from 'react';

import { THEME_LIGHT } from 'twenty-ui/theme';

import { type ColumnDef } from '../../types';

// Column headers carry their field's icon. Standard CRM fields are pinned to
// twenty-server's field metadata; the rocket scenario's invented fields take
// the nearest product icon. A column whose field name is shared across
// objects — every object's label identifier is `name` — names its own icon.
const HEADER_ICON_MAP: Record<string, typeof IconCalendar> = {
  accountOwner: IconUserCircle,
  actualLaunchAt: IconCalendarEvent,
  added: IconCalendar,
  address: IconMap,
  arr: IconMoneybag,
  assignee: IconUserCircle,
  calendarEvent: IconCalendarEvent,
  city: IconMapPin,
  company: IconBuildingSkyscraper,
  country: IconFlag,
  createdBy: IconCreativeCommonsSa,
  customer: IconBuildingSkyscraper,
  dueDate: IconCalendarEvent,
  duration: IconClock,
  email: IconMail,
  employees: IconUsers,
  heightMeters: IconRuler,
  icp: IconTarget,
  industry: IconBuildingFactory2,
  jobTitle: IconBriefcase,
  lastEdited: IconCalendarClock,
  lastRun: IconHistory,
  launch: IconCalendarEvent,
  launchDate: IconCalendarEvent,
  launchSite: IconMapPin,
  layoutDashboard: IconLayoutDashboard,
  linkedin: IconBrandLinkedin,
  mainContact: IconUser,
  manufacturer: IconBuildingSkyscraper,
  mapPin: IconMapPin,
  massKg: IconWeight,
  missionCode: Icon123,
  missionType: IconCategory,
  notes: IconNotes,
  opportunities: IconTargetArrow,
  padName: IconMapPin,
  payloadType: IconCategory,
  phone: IconPhone,
  planet: IconPlanet,
  plannedLaunchAt: IconCalendarEvent,
  publishedAt: IconCalendar,
  publishedBy: IconUserCircle,
  relatedTo: IconArrowUpRight,
  reusable: IconRepeat,
  rocket: IconRocket,
  runId: Icon123,
  serialNumber: Icon123,
  settingsAutomation: IconSettingsAutomation,
  siteCode: Icon123,
  siteStatus: IconStatusChange,
  startedAt: IconHistory,
  status: IconStatusChange,
  targetOrbit: IconPlanet,
  title: IconNotes,
  url: IconLink,
  user: IconUser,
  version: IconVersions,
  workflow: IconSettingsAutomation,
};

export function renderTableHeaderIcon(
  column: Pick<ColumnDef, 'id' | 'icon'>,
): ReactNode {
  const Icon = HEADER_ICON_MAP[column.icon ?? column.id] ?? IconTag;
  return (
    <Icon
      aria-hidden
      color={THEME_LIGHT.font.color.tertiary}
      size={THEME_LIGHT.icon.size.md}
      stroke={THEME_LIGHT.icon.stroke.md}
    />
  );
}
