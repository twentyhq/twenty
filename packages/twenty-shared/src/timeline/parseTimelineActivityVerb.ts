import { type TimelineActivityVerb } from '@/timeline/TimelineActivityVerb';

const TIMELINE_ACTIVITY_VERBS: TimelineActivityVerb[] = [
  'created',
  'updated',
  'deleted',
  'restored',
  'linked',
];

const isTimelineActivityVerb = (
  value: string | null | undefined,
): value is TimelineActivityVerb =>
  value !== null &&
  value !== undefined &&
  (TIMELINE_ACTIVITY_VERBS as string[]).includes(value);

export const parseTimelineActivityVerb = (
  name: string | null | undefined,
): TimelineActivityVerb => {
  const verb = name?.split('.')[1];

  return isTimelineActivityVerb(verb) ? verb : 'linked';
};
