import type { NavbarAction } from '../types';

const ROCKET_PINNED_ACTIONS: NavbarAction[] = [
  { icon: 'repeat', label: 'Fly again' },
  { icon: 'calendarPlus', label: 'Schedule launch' },
  { icon: 'playerPause', label: 'Retire' },
];

const LAUNCH_PINNED_ACTIONS: NavbarAction[] = [
  { icon: 'calendarClock', label: 'Reschedule' },
  { icon: 'box', label: 'Add payload' },
  { icon: 'calendarEvent', label: 'Upcoming' },
];

const PAYLOAD_PINNED_ACTIONS: NavbarAction[] = [
  { icon: 'calendarPlus', label: 'Book slot' },
  { icon: 'flag', label: 'Set status' },
];

const COMPANIES_PINNED_ACTIONS: NavbarAction[] = [
  { icon: 'flag', label: 'Set status' },
];

const LAUNCH_SITE_PINNED_ACTIONS: NavbarAction[] = [
  { icon: 'flag', label: 'Set status' },
  { icon: 'calendarPlus', label: 'Book window' },
  { icon: 'rocket', label: 'Launches' },
];

export const OBJECT_PINNED_ACTIONS: Record<string, NavbarAction[]> = {
  rockets: ROCKET_PINNED_ACTIONS,
  launches: LAUNCH_PINNED_ACTIONS,
  payloads: PAYLOAD_PINNED_ACTIONS,
  companies: COMPANIES_PINNED_ACTIONS,
  'launch-sites': LAUNCH_SITE_PINNED_ACTIONS,
};
