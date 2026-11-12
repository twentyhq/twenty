import { filterEventsAndReturnEventsToRemove } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events-and-return-events-to-remove.util';
import { buildFetchedCalendarEvent } from 'src/modules/calendar/calendar-event-import-manager/utils/__tests__/build-fetched-calendar-event.test-util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

const buildParticipant = (handle: string) => ({
  handle,
  displayName: '',
  responseStatus: 'ACCEPTED',
  isOrganizer: false,
});

const filterEvents = ({
  primaryHandle = 'me@acme.com',
  events,
  blocklist = [],
  excludePrivateEvents = false,
  isInternalEventsFilterEnabled = true,
  isInternalMessagesImportEnabled = false,
}: {
  primaryHandle?: string;
  events: FetchedCalendarEvent[];
  blocklist?: string[];
  excludePrivateEvents?: boolean;
  isInternalEventsFilterEnabled?: boolean;
  isInternalMessagesImportEnabled?: boolean;
}) =>
  filterEventsAndReturnEventsToRemove({
    primaryHandle,
    handleAliases: [],
    events,
    blocklist,
    excludePrivateEvents,
    isInternalEventsFilterEnabled,
    isInternalMessagesImportEnabled,
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
    const { filteredEvents, eventsToRemove } = filterEvents({
      events: [regularEvent, cancelledEvent, privateEvent],
    });

    expect(filteredEvents).toEqual([regularEvent, privateEvent]);
    expect(eventsToRemove).toEqual([cancelledEvent]);
  });

  it('should route cancelled and private events to removal when private events are excluded', () => {
    const { filteredEvents, eventsToRemove } = filterEvents({
      events: [regularEvent, cancelledEvent, privateEvent],
      excludePrivateEvents: true,
    });

    expect(filteredEvents).toEqual([regularEvent]);
    expect(eventsToRemove).toEqual([cancelledEvent, privateEvent]);
  });

  it('should drop events with a blocklisted participant', () => {
    const { filteredEvents, eventsToRemove } = filterEvents({
      events: [buildFetchedCalendarEvent()],
      blocklist: ['john@example.com'],
    });

    expect(filteredEvents).toEqual([]);
    expect(eventsToRemove).toEqual([]);
  });

  it('should route internal and solo events to removal for a work handle so saved copies do not go stale', () => {
    const { filteredEvents, eventsToRemove } = filterEvents({
      events: [regularEvent, internalEvent, soloEvent],
    });

    expect(filteredEvents).toEqual([regularEvent]);
    expect(eventsToRemove).toEqual([internalEvent, soloEvent]);
  });

  it('should keep internal and solo events when internal import is enabled', () => {
    const { filteredEvents, eventsToRemove } = filterEvents({
      events: [regularEvent, internalEvent, soloEvent],
      isInternalMessagesImportEnabled: true,
    });

    expect(filteredEvents).toEqual([regularEvent, internalEvent, soloEvent]);
    expect(eventsToRemove).toEqual([]);
  });

  it('should keep internal and solo events when the internal events filter feature flag is off', () => {
    const { filteredEvents, eventsToRemove } = filterEvents({
      events: [regularEvent, internalEvent, soloEvent],
      isInternalEventsFilterEnabled: false,
    });

    expect(filteredEvents).toEqual([regularEvent, internalEvent, soloEvent]);
    expect(eventsToRemove).toEqual([]);
  });

  it('should keep same-domain events for a personal email handle', () => {
    const personalDomainEvent = buildFetchedCalendarEvent({
      id: 'personal-domain',
      participants: [buildParticipant('friend@gmail.com')],
    });

    const { filteredEvents } = filterEvents({
      primaryHandle: 'me@gmail.com',
      events: [personalDomainEvent],
    });

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

    const { filteredEvents } = filterEvents({
      events: [externallyOrganizedEvent, internallyOrganizedEvent],
    });

    expect(filteredEvents).toEqual([externallyOrganizedEvent]);
  });

  it('should route a cancelled internal event to removal once', () => {
    const cancelledInternalEvent = { ...internalEvent, isCanceled: true };

    const { filteredEvents, eventsToRemove } = filterEvents({
      events: [cancelledInternalEvent],
    });

    expect(filteredEvents).toEqual([]);
    expect(eventsToRemove).toEqual([cancelledInternalEvent]);
  });
});
