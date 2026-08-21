import { parseTimelineActivityAction } from '@/timeline/parseTimelineActivityAction';
import {
  isTimelineActivityAction,
  type TimelineActivityAction,
} from '@/timeline/TimelineActivityAction';

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
