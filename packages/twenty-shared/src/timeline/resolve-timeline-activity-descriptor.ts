import {
  isTimelineActivityAction,
  isTimelineActivityKind,
  type TimelineActivityAction,
  type TimelineActivityDescriptor,
  type TimelineActivityKind,
} from '@/timeline/timeline-activity-kind';

type LegacyDecodeInput = {
  name: string | null | undefined;
  linkedObjectNameSingular: string | null | undefined;
};

const LINKED_OBJECT_NAME_TO_KIND: Record<string, TimelineActivityKind> = {
  message: 'linkedMessage',
  calendarEvent: 'linkedCalendarEvent',
  note: 'linkedNote',
  task: 'linkedTask',
};

export const parseTimelineActivityAction = (
  name: string | null | undefined,
): TimelineActivityAction => {
  const action = name?.split('.')[1];

  return isTimelineActivityAction(action) ? action : 'linked';
};

export const legacyDecodeTimelineActivityKind = ({
  linkedObjectNameSingular,
}: LegacyDecodeInput): TimelineActivityKind => {
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
} & LegacyDecodeInput): TimelineActivityDescriptor => {
  const action = parseTimelineActivityAction(name);

  const resolvedKind = isTimelineActivityKind(kind)
    ? kind
    : legacyDecodeTimelineActivityKind({ name, linkedObjectNameSingular });

  return { kind: resolvedKind, action };
};
