import { type DAVClient } from 'tsdav';

import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';

const SERVER_URL = 'https://caldav.example.com';
const PRIMARY_URL = `${SERVER_URL}/calendars/user/primary/`;
const PERSONAL_URL = `${SERVER_URL}/calendars/user/personal/`;
const HREF_A = `${PRIMARY_URL}event-a.ics`;
const HREF_B = `${PRIMARY_URL}event-b.ics`;

const buildICal = (uid: string, dtStart = '20260601T100000Z') =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `SUMMARY:${uid}`,
    `DTSTART:${dtStart}`,
    'DTEND:20260601T110000Z',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

const buildClient = () => {
  const fetchCalendars = jest.fn();
  const syncCollection = jest.fn();
  const calendarMultiGet = jest.fn();
  const propfind = jest.fn();

  return {
    client: {
      serverUrl: SERVER_URL,
      fetchCalendars,
      syncCollection,
      calendarMultiGet,
      propfind,
    } as unknown as DAVClient,
    fetchCalendars,
    syncCollection,
    calendarMultiGet,
    propfind,
  };
};

describe('CalDavFetchEventsService', () => {
  let service: CalDavFetchEventsService;

  beforeEach(() => {
    service = new CalDavFetchEventsService();
  });

  describe('fetchChangedEventHrefs', () => {
    it('collects changed hrefs from sync-collection and ctag/etag calendars without fetching bodies', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
        },
        { url: PERSONAL_URL, components: ['VEVENT'], reports: [], ctag: 'c-1' },
      ]);
      c.syncCollection.mockResolvedValue([
        { href: HREF_A, status: 207, ok: true, props: {} },
      ]);
      c.propfind.mockResolvedValue([
        { href: HREF_B, status: 207, ok: true, props: { getetag: '"etag-b"' } },
      ]);

      const result = await service.fetchChangedEventHrefs(c.client);

      expect(result.changedHrefs.sort()).toEqual([HREF_A, HREF_B].sort());
      expect(result.cancelledHrefs).toEqual([]);
      expect(c.calendarMultiGet).not.toHaveBeenCalled();
    });

    it('separates cancelled (404) hrefs from changed ones in a sync-collection delta', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
        },
      ]);
      c.syncCollection.mockResolvedValue([
        { href: HREF_A, status: 207, ok: true, props: {} },
        { href: HREF_B, status: 404, ok: false, props: {} },
      ]);

      const result = await service.fetchChangedEventHrefs(c.client, {
        syncTokens: { [PRIMARY_URL]: 'token-prior' },
      });

      expect(result.changedHrefs).toEqual([HREF_A]);
      expect(result.cancelledHrefs).toEqual([HREF_B]);
    });

    it('skips network when the server CTag matches the stored CTag', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: [],
          ctag: 'unchanged',
        },
      ]);

      const storedEtags = { [HREF_A]: '"etag-a"' };

      const result = await service.fetchChangedEventHrefs(c.client, {
        syncTokens: {},
        ctags: { [PRIMARY_URL]: 'unchanged' },
        etags: { [PRIMARY_URL]: storedEtags },
      });

      expect(result.changedHrefs).toEqual([]);
      expect(c.propfind).not.toHaveBeenCalled();
      expect(result.syncCursor.etags).toEqual({ [PRIMARY_URL]: storedEtags });
    });

    it('separates changed from vanished hrefs in an etag diff', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: [],
          ctag: 'new-ctag',
        },
      ]);
      c.propfind.mockResolvedValue([
        {
          href: HREF_A,
          status: 207,
          ok: true,
          props: { getetag: '"etag-a-updated"' },
        },
      ]);

      const result = await service.fetchChangedEventHrefs(c.client, {
        syncTokens: {},
        ctags: { [PRIMARY_URL]: 'old-ctag' },
        etags: {
          [PRIMARY_URL]: { [HREF_A]: '"etag-a"', [HREF_B]: '"etag-b"' },
        },
      });

      expect(result.changedHrefs).toEqual([HREF_A]);
      expect(result.cancelledHrefs).toEqual([HREF_B]);
    });

    it('preserves the prior cursor entry for a calendar whose sync fails', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
        },
      ]);
      c.syncCollection.mockRejectedValue(new Error('network blip'));

      const result = await service.fetchChangedEventHrefs(c.client, {
        syncTokens: { [PRIMARY_URL]: 'token-prior' },
      });

      expect(result.changedHrefs).toEqual([]);
      expect(result.cancelledHrefs).toEqual([]);
      expect(result.syncCursor.syncTokens[PRIMARY_URL]).toBe('token-prior');
    });

    it('omits the sync-token on the first run so the server returns a full listing', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
        },
      ]);
      c.syncCollection.mockResolvedValue([
        { href: HREF_A, status: 207, ok: true, props: {} },
      ]);

      await service.fetchChangedEventHrefs(c.client);

      expect(c.syncCollection).toHaveBeenCalledWith(
        expect.not.objectContaining({ syncToken: expect.anything() }),
      );
    });
  });

  describe('fetchEventsByHrefs', () => {
    it('fetches bodies for the given hrefs grouped by calendar collection', async () => {
      const c = buildClient();

      c.calendarMultiGet.mockResolvedValue([
        { href: HREF_A, props: { calendarData: buildICal('uid-a') } },
      ]);

      const events = await service.fetchEventsByHrefs(c.client, [HREF_A]);

      expect(c.calendarMultiGet).toHaveBeenCalledWith(
        expect.objectContaining({ url: PRIMARY_URL, objectUrls: [HREF_A] }),
      );
      expect(events.map((event) => event.iCalUid)).toEqual(['uid-a']);
    });

    it('drops events that fall outside the import time window', async () => {
      const c = buildClient();

      c.calendarMultiGet.mockResolvedValue([
        {
          href: HREF_A,
          props: { calendarData: buildICal('uid-a', '20990101T100000Z') },
        },
      ]);

      const events = await service.fetchEventsByHrefs(c.client, [HREF_A]);

      expect(events).toEqual([]);
    });
  });
});
