import { ConnectedAccountProvider } from 'twenty-shared/types';

import { buildCalendarEventIdSharedByEventExternalId } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-id-shared-by-event-external-id.util';

describe('buildCalendarEventIdSharedByEventExternalId', () => {
  describe('Google', () => {
    it('matches an occurrence on the provider id another channel already stored', () => {
      expect(
        buildCalendarEventIdSharedByEventExternalId({
          provider: ConnectedAccountProvider.GOOGLE,
          fetchedCalendarEvents: [
            { id: 'series_20261012T090000Z', iCalUid: 'series@google.com' },
          ],
          otherChannelAssociations: [
            {
              eventExternalId: 'series_20261012T090000Z',
              calendarEventId: 'stored-event-id',
            },
          ],
          otherChannelCalendarEvents: [],
        }),
      ).toEqual(new Map([['series_20261012T090000Z', 'stored-event-id']]));
    });

    it('keeps occurrences of one series apart even though they share an iCalUid', () => {
      expect(
        buildCalendarEventIdSharedByEventExternalId({
          provider: ConnectedAccountProvider.GOOGLE,
          fetchedCalendarEvents: [
            { id: 'series_20261019T090000Z', iCalUid: 'series@google.com' },
          ],
          otherChannelAssociations: [
            {
              eventExternalId: 'series_20261012T090000Z',
              calendarEventId: 'stored-event-id',
            },
          ],
          otherChannelCalendarEvents: [
            { id: 'stored-event-id', iCalUid: 'series@google.com' },
          ],
        }),
      ).toEqual(new Map());
    });
  });

  describe('Microsoft', () => {
    it('matches a meeting on its iCalUid since each mailbox has its own id', () => {
      expect(
        buildCalendarEventIdSharedByEventExternalId({
          provider: ConnectedAccountProvider.MICROSOFT,
          fetchedCalendarEvents: [
            { id: 'mailbox-b-event-id', iCalUid: 'meeting-ical-uid' },
          ],
          otherChannelAssociations: [
            {
              eventExternalId: 'mailbox-a-event-id',
              calendarEventId: 'stored-event-id',
            },
          ],
          otherChannelCalendarEvents: [
            { id: 'stored-event-id', iCalUid: 'meeting-ical-uid' },
          ],
        }),
      ).toEqual(new Map([['mailbox-b-event-id', 'stored-event-id']]));
    });

    it('ignores events that no other channel is associated with', () => {
      expect(
        buildCalendarEventIdSharedByEventExternalId({
          provider: ConnectedAccountProvider.MICROSOFT,
          fetchedCalendarEvents: [
            { id: 'mailbox-b-event-id', iCalUid: 'meeting-ical-uid' },
          ],
          otherChannelAssociations: [],
          otherChannelCalendarEvents: [
            { id: 'stored-event-id', iCalUid: 'meeting-ical-uid' },
          ],
        }),
      ).toEqual(new Map());
    });

    it('never matches a fetched event without an iCalUid', () => {
      expect(
        buildCalendarEventIdSharedByEventExternalId({
          provider: ConnectedAccountProvider.MICROSOFT,
          fetchedCalendarEvents: [{ id: 'mailbox-b-event-id', iCalUid: '' }],
          otherChannelAssociations: [
            {
              eventExternalId: 'mailbox-a-event-id',
              calendarEventId: 'stored-event-id',
            },
          ],
          otherChannelCalendarEvents: [{ id: 'stored-event-id', iCalUid: '' }],
        }),
      ).toEqual(new Map());
    });
  });

  it('links a stored event to at most one fetched event per batch', () => {
    expect(
      buildCalendarEventIdSharedByEventExternalId({
        provider: ConnectedAccountProvider.MICROSOFT,
        fetchedCalendarEvents: [
          { id: 'first-event-id', iCalUid: 'meeting-ical-uid' },
          { id: 'second-event-id', iCalUid: 'meeting-ical-uid' },
        ],
        otherChannelAssociations: [
          {
            eventExternalId: 'mailbox-a-event-id',
            calendarEventId: 'stored-event-id',
          },
        ],
        otherChannelCalendarEvents: [
          { id: 'stored-event-id', iCalUid: 'meeting-ical-uid' },
        ],
      }),
    ).toEqual(new Map([['first-event-id', 'stored-event-id']]));
  });
});
