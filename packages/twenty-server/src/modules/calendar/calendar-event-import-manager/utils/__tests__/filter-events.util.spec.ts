import { filterEventsAndReturnCancelledEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

const buildFetchedCalendarEvent = (
  overrides: Partial<FetchedCalendarEvent>,
): FetchedCalendarEvent => ({
  id: 'event-id',
  title: 'Event title',
  iCalUid: 'event-id@provider.com',
  description: '',
  startsAt: '2026-01-15T14:00:00Z',
  endsAt: '2026-01-15T15:00:00Z',
  location: '',
  isFullDay: false,
  isCanceled: false,
  conferenceLinkLabel: '',
  conferenceLinkUrl: '',
  externalCreatedAt: '2026-01-01T10:00:00Z',
  externalUpdatedAt: '2026-01-02T10:00:00Z',
  conferenceSolution: '',
  participants: [],
  status: '',
  ...overrides,
});

describe('filterEventsAndReturnCancelledEvents', () => {
  const calendarChannelHandles = ['owner@example.com'];

  it('should keep all non-cancelled events when no synced categories are configured', () => {
    const events = [
      buildFetchedCalendarEvent({ id: '1', categories: ['Personal'] }),
      buildFetchedCalendarEvent({ id: '2', categories: [] }),
      buildFetchedCalendarEvent({ id: '3', isCanceled: true }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(calendarChannelHandles, events, []);

    expect(filteredEvents.map((event) => event.id)).toEqual(['1', '2']);
    expect(cancelledEvents.map((event) => event.id)).toEqual(['3']);
  });

  it('should treat an empty synced categories list as no filtering', () => {
    const events = [
      buildFetchedCalendarEvent({ id: '1', categories: ['Personal'] }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannelHandles,
        events,
        [],
        [],
      );

    expect(filteredEvents.map((event) => event.id)).toEqual(['1']);
    expect(cancelledEvents).toEqual([]);
  });

  it('should keep only events matching a synced category and cancel the rest', () => {
    const events = [
      buildFetchedCalendarEvent({
        id: '1',
        categories: ['Client Meeting'],
      }),
      buildFetchedCalendarEvent({ id: '2', categories: ['Personal'] }),
      buildFetchedCalendarEvent({ id: '3', categories: [] }),
      buildFetchedCalendarEvent({ id: '4', categories: undefined }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannelHandles,
        events,
        [],
        ['Client Meeting'],
      );

    expect(filteredEvents.map((event) => event.id)).toEqual(['1']);
    expect(cancelledEvents.map((event) => event.id)).toEqual(['2', '3', '4']);
  });

  it('should match events tagged with any of the synced categories', () => {
    const events = [
      buildFetchedCalendarEvent({
        id: '1',
        categories: ['Personal', 'Conference'],
      }),
      buildFetchedCalendarEvent({ id: '2', categories: ['Personal'] }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannelHandles,
        events,
        [],
        ['Client Meeting', 'Conference'],
      );

    expect(filteredEvents.map((event) => event.id)).toEqual(['1']);
    expect(cancelledEvents.map((event) => event.id)).toEqual(['2']);
  });

  it('should match categories case-insensitively and ignore surrounding whitespace', () => {
    const events = [
      buildFetchedCalendarEvent({
        id: '1',
        categories: ['client meeting'],
      }),
      buildFetchedCalendarEvent({ id: '2', categories: ['Personal'] }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannelHandles,
        events,
        [],
        ['  Client Meeting  '],
      );

    expect(filteredEvents.map((event) => event.id)).toEqual(['1']);
    expect(cancelledEvents.map((event) => event.id)).toEqual(['2']);
  });

  it('should ignore whitespace-only synced categories', () => {
    const events = [
      buildFetchedCalendarEvent({ id: '1', categories: ['Personal'] }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannelHandles,
        events,
        [],
        ['   '],
      );

    expect(filteredEvents.map((event) => event.id)).toEqual(['1']);
    expect(cancelledEvents).toEqual([]);
  });

  it('should cancel events that are cancelled even when they match a synced category', () => {
    const events = [
      buildFetchedCalendarEvent({
        id: '1',
        isCanceled: true,
        categories: ['Client Meeting'],
      }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannelHandles,
        events,
        [],
        ['Client Meeting'],
      );

    expect(filteredEvents).toEqual([]);
    expect(cancelledEvents.map((event) => event.id)).toEqual(['1']);
  });

  it('should drop blocklisted events entirely instead of cancelling them', () => {
    const events = [
      buildFetchedCalendarEvent({
        id: '1',
        categories: ['Client Meeting'],
        participants: [
          {
            handle: 'blocked@example.com',
            displayName: 'Blocked Person',
            isOrganizer: false,
            responseStatus: 'ACCEPTED',
          },
        ],
      }),
    ];

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannelHandles,
        events,
        ['blocked@example.com'],
        ['Client Meeting'],
      );

    expect(filteredEvents).toEqual([]);
    expect(cancelledEvents).toEqual([]);
  });
});
