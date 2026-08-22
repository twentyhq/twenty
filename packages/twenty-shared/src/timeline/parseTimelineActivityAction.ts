import {
  isTimelineActivityAction,
  type TimelineActivityAction,
} from '@/timeline/TimelineActivityAction';

export const parseTimelineActivityAction = (
  name: string | null | undefined,
): TimelineActivityAction => {
  const action = name?.split('.')[1];

  return isTimelineActivityAction(action) ? action : 'linked';
};
