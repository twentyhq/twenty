export type TimelineActivityKind =
  | 'recordChange'
  | 'linkedNote'
  | 'linkedTask'
  | 'linkedMessage'
  | 'linkedCalendarEvent'
  | 'linkedRecord';

export type TimelineActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'linked';

export type TimelineActivityDescriptor = {
  kind: TimelineActivityKind;
  action: TimelineActivityAction;
};

export const TIMELINE_ACTIVITY_KINDS: TimelineActivityKind[] = [
  'recordChange',
  'linkedNote',
  'linkedTask',
  'linkedMessage',
  'linkedCalendarEvent',
  'linkedRecord',
];

export const TIMELINE_ACTIVITY_ACTIONS: TimelineActivityAction[] = [
  'created',
  'updated',
  'deleted',
  'restored',
  'linked',
];

export const isTimelineActivityKind = (
  value: string | null | undefined,
): value is TimelineActivityKind =>
  value !== null &&
  value !== undefined &&
  (TIMELINE_ACTIVITY_KINDS as string[]).includes(value);

export const isTimelineActivityAction = (
  value: string | null | undefined,
): value is TimelineActivityAction =>
  value !== null &&
  value !== undefined &&
  (TIMELINE_ACTIVITY_ACTIONS as string[]).includes(value);
