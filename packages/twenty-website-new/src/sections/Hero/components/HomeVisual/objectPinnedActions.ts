import type { HeroNavbarActionType } from '../../types/HeroHomeData';

// Each object registers its own pinned commands — these render to the left of
// the New Record button once the chat has created/revealed the object. The
// action shapes are intentionally identical to the real Twenty command-menu
// item model (label + icon) so the mock lines up with what the assistant
// announces in the chat paragraph. Kept in sync with the source files in
// editorData.ts under src/command-menu-items/.

type PinnedAction = HeroNavbarActionType;

// Max 3 commands per object — reserved for the highest-value ops so the
// header stays readable alongside the built-in New Record button.
const ROCKET_PINNED_ACTIONS: PinnedAction[] = [
  // "Fly again" leans into reusable-rocket ops: re-fly this vehicle on a new
  // mission. Paired with launch scheduling and retirement to cover a rocket's
  // full lifecycle (reuse / schedule / retire).
  { icon: 'repeat', label: 'Fly again' },
  { icon: 'calendarPlus', label: 'Schedule launch' },
  { icon: 'playerPause', label: 'Retire' },
];

const LAUNCH_PINNED_ACTIONS: PinnedAction[] = [
  { icon: 'calendarClock', label: 'Reschedule' },
  { icon: 'box', label: 'Add payload' },
  { icon: 'calendarEvent', label: 'Upcoming' },
];

const PAYLOAD_PINNED_ACTIONS: PinnedAction[] = [
  // Action-oriented verb + space-ops framing: customers book launch slots.
  // Scopes the quick-create to a customer-linked payload without leaning on
  // "New" (which collides with the default New button).
  { icon: 'calendarPlus', label: 'Book slot' },
  { icon: 'flag', label: 'Set status' },
];

const COMPANIES_PINNED_ACTIONS: PinnedAction[] = [
  { icon: 'flag', label: 'Set status' },
];

const LAUNCH_SITE_PINNED_ACTIONS: PinnedAction[] = [
  // Status transitions (Active / Standby / Maintenance) are the most common
  // site-level op; the other two are high-value jumps into related data.
  { icon: 'flag', label: 'Set status' },
  { icon: 'calendarPlus', label: 'Book window' },
  { icon: 'rocket', label: 'Launches' },
];

export const OBJECT_PINNED_ACTIONS: Record<string, PinnedAction[]> = {
  rockets: ROCKET_PINNED_ACTIONS,
  launches: LAUNCH_PINNED_ACTIONS,
  payloads: PAYLOAD_PINNED_ACTIONS,
  companies: COMPANIES_PINNED_ACTIONS,
  'launch-sites': LAUNCH_SITE_PINNED_ACTIONS,
};
