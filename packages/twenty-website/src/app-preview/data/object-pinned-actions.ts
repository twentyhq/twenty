import { type NavbarAction } from '../types';

// Each created object pins 2-3 quick commands next to the navbar's New
// button, keyed by the object's sidebar id.
export const OBJECT_PINNED_ACTIONS: Record<string, NavbarAction[]> = {
  rockets: [
    { icon: 'repeat', label: 'Fly again' },
    { icon: 'calendarPlus', label: 'Schedule launch' },
    { icon: 'playerPause', label: 'Retire' },
  ],
  launches: [
    { icon: 'calendarClock', label: 'Reschedule' },
    { icon: 'box', label: 'Add payload' },
    { icon: 'calendarEvent', label: 'Upcoming' },
  ],
  payloads: [
    { icon: 'calendarPlus', label: 'Book slot' },
    { icon: 'flag', label: 'Set status' },
  ],
  companies: [{ icon: 'flag', label: 'Set status' }],
  'launch-sites': [
    { icon: 'flag', label: 'Set status' },
    { icon: 'calendarPlus', label: 'Book window' },
    { icon: 'rocket', label: 'Launches' },
  ],
};
