import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray, parseToInstantOrThrow } from 'twenty-shared/utils';

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

const toEpochMilliseconds = (value: string | Date | null): number | null => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (!isNonEmptyString(value)) {
    return null;
  }

  try {
    return parseToInstantOrThrow(value).epochMilliseconds;
  } catch {
    return Number.NaN;
  }
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
  DATE_TIME_FIELD_NAMES.some(
    (fieldName) =>
      toEpochMilliseconds(existingCalendarEvent[fieldName]) !==
      toEpochMilliseconds(calendarEvent[fieldName]),
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
