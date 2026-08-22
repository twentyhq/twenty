import { isDefined } from '@/utils/validation';

// The frontend components a timeline row can be drawn with. A type names one so
// the row is chosen by metadata rather than by branching on the linked object.
export const TIMELINE_ACTIVITY_RENDERERS = [
  'mainObject',
  'genericLinked',
  'activity',
  'message',
  'calendarEvent',
] as const;

export type TimelineActivityRenderer =
  (typeof TIMELINE_ACTIVITY_RENDERERS)[number];

export const isTimelineActivityRenderer = (
  value: string | null | undefined,
): value is TimelineActivityRenderer =>
  isDefined(value) &&
  (TIMELINE_ACTIVITY_RENDERERS as readonly string[]).includes(value);
