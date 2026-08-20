import { isDefined } from '@/utils/validation';

export type TimelineActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'linked';

export const TIMELINE_ACTIVITY_ACTIONS: TimelineActivityAction[] = [
  'created',
  'updated',
  'deleted',
  'restored',
  'linked',
];

export const isTimelineActivityAction = (
  value: string | null | undefined,
): value is TimelineActivityAction =>
  isDefined(value) && (TIMELINE_ACTIVITY_ACTIONS as string[]).includes(value);
