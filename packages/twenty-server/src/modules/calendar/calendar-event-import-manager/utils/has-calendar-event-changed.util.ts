import { isNonEmptyArray } from 'twenty-shared/utils';

import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

type CalendarEventWritableFields = Pick<
  CalendarEventWorkspaceEntity,
  | 'iCalUid'
  | 'title'
  | 'description'
  | 'startsAt'
  | 'endsAt'
  | 'location'
  | 'isFullDay'
  | 'isCanceled'
  | 'conferenceSolution'
  | 'externalCreatedAt'
  | 'externalUpdatedAt'
> & {
  conferenceLink: Pick<
    CalendarEventWorkspaceEntity['conferenceLink'],
    'primaryLinkLabel' | 'primaryLinkUrl'
  >;
};

const TEXT_FIELD_NAMES = [
  'iCalUid',
  'title',
  'description',
  'location',
  'conferenceSolution',
] as const;

const DATE_TIME_FIELD_NAMES = [
  'startsAt',
  'endsAt',
  'externalCreatedAt',
  'externalUpdatedAt',
] as const;

const BOOLEAN_FIELD_NAMES = ['isFullDay', 'isCanceled'] as const;

// Persisted timestamps come back as Date while providers send ISO strings with varying offsets
const toTimestamp = (value: string | Date | null | undefined): number | null =>
  value === null || value === undefined || value === ''
    ? null
    : new Date(value).getTime();

export const hasCalendarEventChanged = ({
  existingCalendarEvent,
  calendarEvent,
}: {
  existingCalendarEvent: CalendarEventWorkspaceEntity;
  calendarEvent: CalendarEventWritableFields;
}): boolean =>
  TEXT_FIELD_NAMES.some(
    (fieldName) =>
      (existingCalendarEvent[fieldName] ?? '') !==
      (calendarEvent[fieldName] ?? ''),
  ) ||
  DATE_TIME_FIELD_NAMES.some(
    (fieldName) =>
      toTimestamp(existingCalendarEvent[fieldName]) !==
      toTimestamp(calendarEvent[fieldName]),
  ) ||
  BOOLEAN_FIELD_NAMES.some(
    (fieldName) =>
      Boolean(existingCalendarEvent[fieldName]) !==
      Boolean(calendarEvent[fieldName]),
  ) ||
  (existingCalendarEvent.conferenceLink?.primaryLinkLabel ?? '') !==
    (calendarEvent.conferenceLink.primaryLinkLabel ?? '') ||
  (existingCalendarEvent.conferenceLink?.primaryLinkUrl ?? '') !==
    (calendarEvent.conferenceLink.primaryLinkUrl ?? '') ||
  isNonEmptyArray(existingCalendarEvent.conferenceLink?.secondaryLinks);
