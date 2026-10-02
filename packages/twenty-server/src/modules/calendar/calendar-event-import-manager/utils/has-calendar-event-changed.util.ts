import { isEqual } from 'date-fns';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

export type ComparableCalendarEvent = Pick<
  CalendarEventWorkspaceEntity,
  | 'id'
  | 'iCalUid'
  | 'title'
  | 'description'
  | 'startsAt'
  | 'endsAt'
  | 'location'
  | 'isFullDay'
  | 'isCanceled'
  | 'conferenceSolution'
  | 'conferenceLink'
>;

const TEXT_FIELD_NAMES = [
  'iCalUid',
  'title',
  'description',
  'location',
  'conferenceSolution',
] as const;

const DATE_TIME_FIELD_NAMES = ['startsAt', 'endsAt'] as const;

const BOOLEAN_FIELD_NAMES = ['isFullDay', 'isCanceled'] as const;

const hasDateTimeChanged = (
  existingValue: string | null,
  fetchedValue: string | null,
): boolean => {
  const existingDateTime = existingValue || null;
  const fetchedDateTime = fetchedValue || null;

  if (!isDefined(existingDateTime) || !isDefined(fetchedDateTime)) {
    return existingDateTime !== fetchedDateTime;
  }

  return !isEqual(existingDateTime, fetchedDateTime);
};

export const hasCalendarEventChanged = ({
  existingCalendarEvent,
  calendarEvent,
}: {
  existingCalendarEvent: ComparableCalendarEvent;
  calendarEvent: Omit<ComparableCalendarEvent, 'id'>;
}): boolean =>
  TEXT_FIELD_NAMES.some(
    (fieldName) =>
      (existingCalendarEvent[fieldName] ?? '') !==
      (calendarEvent[fieldName] ?? ''),
  ) ||
  DATE_TIME_FIELD_NAMES.some((fieldName) =>
    hasDateTimeChanged(
      existingCalendarEvent[fieldName],
      calendarEvent[fieldName],
    ),
  ) ||
  BOOLEAN_FIELD_NAMES.some(
    (fieldName) =>
      existingCalendarEvent[fieldName] !== calendarEvent[fieldName],
  ) ||
  (existingCalendarEvent.conferenceLink?.primaryLinkLabel ?? '') !==
    (calendarEvent.conferenceLink.primaryLinkLabel ?? '') ||
  (existingCalendarEvent.conferenceLink?.primaryLinkUrl ?? '') !==
    (calendarEvent.conferenceLink.primaryLinkUrl ?? '') ||
  isNonEmptyArray(existingCalendarEvent.conferenceLink?.secondaryLinks);
