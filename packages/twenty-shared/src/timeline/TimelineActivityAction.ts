import { isDefined } from '@/utils/validation';

export const TIMELINE_ACTIVITY_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'restored',
  'linked',
  'unlinked',
] as const;

export type TimelineActivityAction = (typeof TIMELINE_ACTIVITY_ACTIONS)[number];

export const isTimelineActivityAction = (
  value: string | null | undefined,
): value is TimelineActivityAction =>
  isDefined(value) &&
  (TIMELINE_ACTIVITY_ACTIONS as readonly string[]).includes(value);
