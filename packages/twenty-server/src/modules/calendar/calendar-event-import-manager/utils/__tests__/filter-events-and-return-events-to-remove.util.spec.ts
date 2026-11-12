import { filterEventsAndReturnEventsToRemove } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events-and-return-events-to-remove.util';
import { buildFetchedCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/utils/__tests__/build-fetched-calendar-event.test-util';

const buildParticipant = (handle: string) => ({
  handle,
  displayName: '',
  responseStatus: 'ACCEPTED',
  isOrganizer: false,
});

describe('filterEventsAndReturnEventsToRemove', () => {
  const regularEvent = buildFetchedCalendarEvent({ id: 'regular' });
  const cancelledEvent = buildFetchedCalendarEvent({
    id: 'cancelled',
    isCanceled: true,
  });
  const privateEvent = buildFetchedCalendarEvent({
    id: 'private',
    isPrivate: true,
  });
  const internalEvent = buildFetchedCalendarEvent({
    id: 'internal',
    participants: [
      buildParticipant('me@acme.com'),
      buildParticipant('colleague@acme.com'),
    ],
  });
  const soloEvent = buildFetchedCalendarEvent({
    id: 'solo',
    participants: [],
  });

  it('should keep private events and route cancelled events to removal when private events are not excluded', () => {
    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        'me@acme.com',
        [],
        [regularEvent, cancelledEvent, privateEvent],
        [],
        false,
        false,
      );

    expect(filteredEvents).toEqual([regularEvent, privateEvent]);
    expect(eventsToRemove).toEqual([cancelledEvent]);
  });

  it('should route cancelled and private events to removal when private events are excluded', () => {
    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        'me@acme.com',
        [],
        [regularEvent, cancelledEvent, privateEvent],
        [],
        true,
        false,
      );

    expect(filteredEvents).toEqual([regularEvent]);
    expect(eventsToRemove).toEqual([cancelledEvent, privateEvent]);
  });

  it('should drop events with a blocklisted participant', () => {
    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        'me@acme.com',
        [],
        [buildFetchedCalendarEvent()],
        ['john@example.com'],
        false,
        false,
      );

    expect(filteredEvents).toEqual([]);
    expect(eventsToRemove).toEqual([]);
  });

  it('should drop internal and solo events for a work handle', () => {
    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        'me@acme.com',
        [],
        [regularEvent, internalEvent, soloEvent],
        [],
        false,
        false,
      );

    expect(filteredEvents).toEqual([regularEvent]);
    expect(eventsToRemove).toEqual([]);
  });

  it('should keep internal and solo events when internal import is enabled', () => {
    const { filteredEvents } = filterEventsAndReturnEventsToRemove(
      'me@acme.com',
      [],
      [regularEvent, internalEvent, soloEvent],
      [],
      false,
      true,
    );

    expect(filteredEvents).toEqual([regularEvent, internalEvent, soloEvent]);
  });

  it('should keep same-domain events for a personal email handle', () => {
    const personalDomainEvent = buildFetchedCalendarEvent({
      id: 'personal-domain',
      participants: [buildParticipant('friend@gmail.com')],
    });

    const { filteredEvents } = filterEventsAndReturnEventsToRemove(
      'me@gmail.com',
      [],
      [personalDomainEvent],
      [],
      false,
      false,
    );

    expect(filteredEvents).toEqual([personalDomainEvent]);
  });

  it('should keep an event whose organizer is external even when every attendee is internal', () => {
    const externallyOrganizedEvent = buildFetchedCalendarEvent({
      id: 'externally-organized',
      organizerHandle: 'customer@example.com',
      participants: [buildParticipant('me@acme.com')],
    });
    const internallyOrganizedEvent = buildFetchedCalendarEvent({
      id: 'internally-organized',
      organizerHandle: 'colleague@acme.com',
      participants: [buildParticipant('me@acme.com')],
    });

    const { filteredEvents } = filterEventsAndReturnEventsToRemove(
      'me@acme.com',
      [],
      [externallyOrganizedEvent, internallyOrganizedEvent],
      [],
      false,
      false,
    );

    expect(filteredEvents).toEqual([externallyOrganizedEvent]);
  });

  it('should still route a cancelled internal event to removal', () => {
    const cancelledInternalEvent = { ...internalEvent, isCanceled: true };

    const { filteredEvents, eventsToRemove } =
      filterEventsAndReturnEventsToRemove(
        'me@acme.com',
        [],
        [cancelledInternalEvent],
        [],
        false,
        false,
      );

    expect(filteredEvents).toEqual([]);
    expect(eventsToRemove).toEqual([cancelledInternalEvent]);
  });
});
