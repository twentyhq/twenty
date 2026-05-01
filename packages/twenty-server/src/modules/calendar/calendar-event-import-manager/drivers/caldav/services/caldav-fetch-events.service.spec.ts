import { type DAVClient } from 'tsdav';

import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';

const PRIMARY_URL = 'https://caldav.example.com/calendars/user/primary/';
const PERSONAL_URL = 'https://caldav.example.com/calendars/user/personal/';
const HREF_A = `${PRIMARY_URL}event-a.ics`;
const HREF_B = `${PRIMARY_URL}event-b.ics`;

const buildICal = (uid: string) =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `SUMMARY:${uid}`,
    'DTSTART:20260601T100000Z',
    'DTEND:20260601T110000Z',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

const inWindow = {
  startDate: new Date('2026-01-01'),
  endDate: new Date('2027-01-01'),
};

const buildClient = () => {
  const fetchCalendars = jest.fn();
  const syncCollection = jest.fn();
  const calendarMultiGet = jest.fn();
  const propfind = jest.fn();

  return {
    client: {
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

  describe('per-calendar tier dispatch', () => {
    it('runs Tier-1 on calendars advertising sync-collection and Tier-2/3 on the rest, in parallel', async () => {
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
        { href: HREF_A, status: 207, statusText: 'OK', ok: true, props: {} },
      ]);

      c.propfind.mockResolvedValue([
        {
          href: HREF_B,
          status: 207,
          statusText: 'OK',
          ok: true,
          props: { getetag: '"etag-b"' },
        },
      ]);

      c.calendarMultiGet
        .mockResolvedValueOnce([
          {
            href: HREF_A,
            status: 207,
            statusText: 'OK',
            ok: true,
            props: { calendarData: buildICal('uid-a') },
          },
        ])
        .mockResolvedValueOnce([
          {
            href: HREF_B,
            status: 207,
            statusText: 'OK',
            ok: true,
            props: { calendarData: buildICal('uid-b') },
          },
        ]);

      const result = await service.fetchEvents(c.client, inWindow);

      expect(result.events.map((event) => event.iCalUid).sort()).toEqual([
        'uid-a',
        'uid-b',
      ]);
      expect(c.syncCollection).toHaveBeenCalledTimes(1);
      expect(c.propfind).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tier-2/3 ctag short-circuit', () => {
    it('skips network entirely when the server CTag matches the stored CTag', async () => {
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

      const result = await service.fetchEvents(c.client, {
        ...inWindow,
        syncCursor: {
          syncTokens: {},
          ctags: { [PRIMARY_URL]: 'unchanged' },
          etags: { [PRIMARY_URL]: storedEtags },
        },
      });

      expect(result.events).toEqual([]);
      expect(c.propfind).not.toHaveBeenCalled();
      expect(c.calendarMultiGet).not.toHaveBeenCalled();
      expect(result.syncCursor.etags).toEqual({ [PRIMARY_URL]: storedEtags });
    });
  });

  describe('Tier-2/3 etag diff', () => {
    it('fetches only changed hrefs and emits cancelled stubs for hrefs vanished from the server', async () => {
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
          statusText: 'OK',
          ok: true,
          props: { getetag: '"etag-a-updated"' },
        },
      ]);

      c.calendarMultiGet.mockResolvedValue([
        {
          href: HREF_A,
          status: 207,
          statusText: 'OK',
          ok: true,
          props: { calendarData: buildICal('uid-a') },
        },
      ]);

      const result = await service.fetchEvents(c.client, {
        ...inWindow,
        syncCursor: {
          syncTokens: {},
          ctags: { [PRIMARY_URL]: 'old-ctag' },
          etags: {
            [PRIMARY_URL]: { [HREF_A]: '"etag-a"', [HREF_B]: '"etag-b"' },
          },
        },
      });

      expect(c.calendarMultiGet).toHaveBeenCalledWith(
        expect.objectContaining({ objectUrls: [HREF_A] }),
      );

      const live = result.events.filter((event) => !event.isCanceled);
      const cancelled = result.events.filter((event) => event.isCanceled);

      expect(live.map((event) => event.iCalUid)).toEqual(['uid-a']);
      expect(cancelled.map((event) => event.id)).toEqual([HREF_B]);
    });
  });

  describe('per-calendar error isolation', () => {
    it('preserves the prior cursor entry (token + ctag + etags) for the failing calendar without aborting siblings', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
        },
        {
          url: PERSONAL_URL,
          components: ['VEVENT'],
          reports: [],
          ctag: 'c-new',
        },
      ]);

      c.syncCollection.mockRejectedValue(new Error('network blip'));
      c.propfind.mockRejectedValue(new Error('propfind blip'));

      const priorEtags = { [HREF_A]: '"etag-a"' };

      const result = await service.fetchEvents(c.client, {
        ...inWindow,
        syncCursor: {
          syncTokens: { [PRIMARY_URL]: 'token-prior' },
          ctags: { [PERSONAL_URL]: 'c-prior' },
          etags: { [PERSONAL_URL]: priorEtags },
        },
      });

      expect(result.events).toEqual([]);
      expect(result.syncCursor.syncTokens[PRIMARY_URL]).toBe('token-prior');
      expect(result.syncCursor.ctags?.[PERSONAL_URL]).toBe('c-prior');
      expect(result.syncCursor.etags?.[PERSONAL_URL]).toEqual(priorEtags);
    });
  });

  describe('cursor shape', () => {
    it('omits ctags and etags entirely when only sync-collection calendars exist', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
        },
      ]);
      c.syncCollection.mockResolvedValue([
        {
          status: 207,
          statusText: 'OK',
          ok: true,
          raw: { multistatus: { syncToken: 'token-fresh' } },
        },
      ]);
      c.calendarMultiGet.mockResolvedValue([]);

      const result = await service.fetchEvents(c.client, inWindow);

      expect(result.syncCursor).toEqual({
        syncTokens: { [PRIMARY_URL]: 'token-fresh' },
      });
    });
  });

  describe('initial sync (no stored cursor)', () => {
    it('omits the sync-token on the first run so the server returns a full listing (RFC 6578 §3.4)', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
          syncToken: 'server-current-token',
        },
      ]);
      c.syncCollection.mockResolvedValue([
        { href: HREF_A, status: 207, statusText: 'OK', ok: true, props: {} },
      ]);
      c.calendarMultiGet.mockResolvedValue([
        {
          href: HREF_A,
          status: 207,
          statusText: 'OK',
          ok: true,
          props: { calendarData: buildICal('uid-a') },
        },
      ]);

      await service.fetchEvents(c.client, inWindow);

      expect(c.syncCollection).toHaveBeenCalledWith(
        expect.not.objectContaining({ syncToken: expect.anything() }),
      );
    });
  });

  describe('time-window filtering', () => {
    it('drops events that fall outside the requested [startDate, endDate] window', async () => {
      const c = buildClient();

      c.fetchCalendars.mockResolvedValue([
        {
          url: PRIMARY_URL,
          components: ['VEVENT'],
          reports: ['syncCollection'],
        },
      ]);

      c.syncCollection.mockResolvedValue([
        { href: HREF_A, status: 207, statusText: 'OK', ok: true, props: {} },
      ]);

      c.calendarMultiGet.mockResolvedValue([
        {
          href: HREF_A,
          status: 207,
          statusText: 'OK',
          ok: true,
          props: { calendarData: buildICal('uid-a') },
        },
      ]);

      const result = await service.fetchEvents(c.client, {
        startDate: new Date('2030-01-01'),
        endDate: new Date('2030-12-31'),
      });

      expect(result.events).toEqual([]);
    });
  });
});
