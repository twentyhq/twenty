import { ConnectedAccountProvider } from 'twenty-shared/types';

import { computeCalendarEventSharingKey } from 'src/modules/calendar/calendar-event-import-manager/utils/compute-calendar-event-sharing-key.util';

describe('computeCalendarEventSharingKey', () => {
  it('keeps Google occurrences of one series apart even though they share an iCalUid', () => {
    expect(
      computeCalendarEventSharingKey({
        provider: ConnectedAccountProvider.GOOGLE,
        eventExternalId: 'series_20261012T090000Z',
        iCalUid: 'series@google.com',
      }),
    ).not.toEqual(
      computeCalendarEventSharingKey({
        provider: ConnectedAccountProvider.GOOGLE,
        eventExternalId: 'series_20261019T090000Z',
        iCalUid: 'series@google.com',
      }),
    );
  });

  it('keeps Google events apart when only their calendar-scoped ids collide', () => {
    expect(
      computeCalendarEventSharingKey({
        provider: ConnectedAccountProvider.GOOGLE,
        eventExternalId: 'event-id',
        iCalUid: 'first-meeting@google.com',
      }),
    ).not.toEqual(
      computeCalendarEventSharingKey({
        provider: ConnectedAccountProvider.GOOGLE,
        eventExternalId: 'event-id',
        iCalUid: 'second-meeting@google.com',
      }),
    );
  });

  it('matches Microsoft copies on the iCalUid since each mailbox has its own id', () => {
    expect(
      computeCalendarEventSharingKey({
        provider: ConnectedAccountProvider.MICROSOFT,
        eventExternalId: 'mailbox-a-event-id',
        iCalUid: 'meeting-ical-uid',
      }),
    ).toEqual(
      computeCalendarEventSharingKey({
        provider: ConnectedAccountProvider.MICROSOFT,
        eventExternalId: 'mailbox-b-event-id',
        iCalUid: 'meeting-ical-uid',
      }),
    );
  });

  it.each([
    { provider: ConnectedAccountProvider.GOOGLE, iCalUid: '' },
    { provider: ConnectedAccountProvider.MICROSOFT, iCalUid: null },
    {
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      iCalUid: 'meeting-ical-uid',
    },
  ])(
    'never shares a $provider event with iCalUid "$iCalUid"',
    ({ provider, iCalUid }) => {
      expect(
        computeCalendarEventSharingKey({
          provider,
          eventExternalId: 'event-id',
          iCalUid,
        }),
      ).toBeUndefined();
    },
  );
});
