import { type TimelineActivityAction } from '@/timeline/TimelineActivityAction';
import { isDefined } from '@/utils/validation';

const TIMELINE_ACTIVITY_ACTIONS: TimelineActivityAction[] = [
  'created',
  'updated',
  'deleted',
  'restored',
  'linked',
];

const isTimelineActivityAction = (
  value: string | null | undefined,
): value is TimelineActivityAction =>
  isDefined(value) && (TIMELINE_ACTIVITY_ACTIONS as string[]).includes(value);

export const parseTimelineActivityAction = (
  name: string | null | undefined,
): TimelineActivityAction => {
  const action = name?.split('.')[1];

  return isTimelineActivityAction(action) ? action : 'linked';
};
