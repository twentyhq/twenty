import { parseTimelineActivityAction } from '@/timeline/parseTimelineActivityAction';
import { type TimelineActivityAction } from '@/timeline/TimelineActivityAction';
import { isDefined } from '@/utils/validation';

const TIMELINE_ACTIVITY_ACTIONS: TimelineActivityAction[] = [
  'created',
  'updated',
  'deleted',
  'restored',
  'linked',
  'unlinked',
];

const isTimelineActivityAction = (
  value: string | null | undefined,
): value is TimelineActivityAction =>
  isDefined(value) && (TIMELINE_ACTIVITY_ACTIONS as string[]).includes(value);

// The stored action is authoritative where it disagrees with the legacy name:
// a junction row creation is a link, its deletion an unlink. Rows written
// before the column existed fall back to the same semantics parsed from name.
export const getTimelineActivityAction = (timelineActivity: {
  action?: string | null;
  name: string;
}): TimelineActivityAction => {
  if (isTimelineActivityAction(timelineActivity.action)) {
    return timelineActivity.action;
  }

  const parsedAction = parseTimelineActivityAction(timelineActivity.name);

  if (timelineActivity.name.startsWith('linked-')) {
    if (parsedAction === 'created') {
      return 'linked';
    }

    if (parsedAction === 'deleted') {
      return 'unlinked';
    }
  }

  return parsedAction;
};
