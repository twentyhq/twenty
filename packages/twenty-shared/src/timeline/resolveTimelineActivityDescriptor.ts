import { type TimelineActivityAction } from '@/timeline/TimelineActivityAction';
import { type TimelineActivityKind } from '@/timeline/TimelineActivityKind';

const TIMELINE_ACTIVITY_ACTIONS: TimelineActivityAction[] = [
  'created',
  'updated',
  'deleted',
  'restored',
  'linked',
];

const TIMELINE_ACTIVITY_KINDS: TimelineActivityKind[] = [
  'recordChange',
  'linkedNote',
  'linkedTask',
  'linkedMessage',
  'linkedCalendarEvent',
  'linkedRecord',
];

const LINKED_OBJECT_NAME_TO_KIND: Record<string, TimelineActivityKind> = {
  message: 'linkedMessage',
  calendarEvent: 'linkedCalendarEvent',
  note: 'linkedNote',
  task: 'linkedTask',
};

const isTimelineActivityKind = (
  value: string | null | undefined,
): value is TimelineActivityKind =>
  value !== null &&
  value !== undefined &&
  (TIMELINE_ACTIVITY_KINDS as string[]).includes(value);

const isTimelineActivityAction = (
  value: string | null | undefined,
): value is TimelineActivityAction =>
  value !== null &&
  value !== undefined &&
  (TIMELINE_ACTIVITY_ACTIONS as string[]).includes(value);

const parseTimelineActivityAction = (
  name: string | null | undefined,
): TimelineActivityAction => {
  const action = name?.split('.')[1];

  return isTimelineActivityAction(action) ? action : 'linked';
};

const legacyDecodeTimelineActivityKind = (
  linkedObjectNameSingular: string | null | undefined,
): TimelineActivityKind => {
  if (
    linkedObjectNameSingular === null ||
    linkedObjectNameSingular === undefined
  ) {
    return 'recordChange';
  }

  return LINKED_OBJECT_NAME_TO_KIND[linkedObjectNameSingular] ?? 'linkedRecord';
};

export const resolveTimelineActivityDescriptor = ({
  kind,
  name,
  linkedObjectNameSingular,
}: {
  kind?: string | null;
  name: string | null | undefined;
  linkedObjectNameSingular: string | null | undefined;
}): { kind: TimelineActivityKind; action: TimelineActivityAction } => {
  const action = parseTimelineActivityAction(name);

  const resolvedKind = isTimelineActivityKind(kind)
    ? kind
    : legacyDecodeTimelineActivityKind(linkedObjectNameSingular);

  return { kind: resolvedKind, action };
};
