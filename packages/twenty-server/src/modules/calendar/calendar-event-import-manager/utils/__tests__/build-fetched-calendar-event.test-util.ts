import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

export const buildFetchedCalendarEvent = (
  overrides: Partial<FetchedCalendarEvent> = {},
): FetchedCalendarEvent => ({
  id: 'external-event-id',
  title: 'Weekly sync',
  iCalUid: 'ical-uid',
  description: 'Agenda',
  startsAt: '2026-10-02T10:00:00+02:00',
  endsAt: '2026-10-02T11:00:00+02:00',
  location: '',
  isFullDay: false,
  isCanceled: false,
  isPrivate: false,
  conferenceLinkLabel: 'Meet',
  conferenceLinkUrl: 'https://meet.example.com/abc',
  externalCreatedAt: '2026-09-01T08:00:00.000Z',
  externalUpdatedAt: '2026-09-15T08:00:00.000Z',
  conferenceSolution: 'hangoutsMeet',
  participants: [
    {
      handle: 'john@example.com',
      displayName: 'John Doe',
      responseStatus: 'ACCEPTED',
      isOrganizer: true,
    },
  ],
  status: 'confirmed',
  organizerHandle: '',
  ...overrides,
});
