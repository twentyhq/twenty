jest.mock('tsdav', () => {
  const actual = jest.requireActual('tsdav');

  return {
    ...actual,
    createAccount: jest.fn(),
    fetchCalendars: jest.fn(),
    syncCollection: jest.fn(),
    calendarMultiGet: jest.fn(),
    propfind: jest.fn(),
  };
});

jest.mock(
  'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/auth/create-basic-digest-auth-fetch',
  () => ({
    createBasicDigestAuthFetch: jest.fn(() => globalThis.fetch),
  }),
);

import {
  calendarMultiGet,
  createAccount,
  fetchCalendars,
  propfind,
  syncCollection,
} from 'tsdav';

import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client';

const mockCreateAccount = createAccount as jest.MockedFunction<
  typeof createAccount
>;
const mockFetchCalendars = fetchCalendars as jest.MockedFunction<
  typeof fetchCalendars
>;
const mockSyncCollection = syncCollection as jest.MockedFunction<
  typeof syncCollection
>;
const mockCalendarMultiGet = calendarMultiGet as jest.MockedFunction<
  typeof calendarMultiGet
>;
const mockPropfind = propfind as jest.MockedFunction<typeof propfind>;

const CALENDAR_URL = 'https://caldav.example.com/calendars/user/default/';
const FIRST_HREF = `${CALENDAR_URL}event-1.ics`;
const SECOND_HREF = `${CALENDAR_URL}event-2.ics`;

const buildICalData = (uid: string, summary: string) =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `SUMMARY:${summary}`,
    'DTSTART:20260501T100000Z',
    'DTEND:20260501T110000Z',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

const buildClient = () =>
  new CalDAVClient({
    serverUrl: 'https://caldav.example.com',
    username: 'user@example.com',
    password: 'password',
  });

const buildLegacyCalendar = (ctag: string) => ({
  url: CALENDAR_URL,
  components: ['VEVENT'],
  reports: [],
  ctag,
});

const buildSyncCollectionCalendar = () => ({
  url: CALENDAR_URL,
  components: ['VEVENT'],
  reports: ['syncCollection'],
  syncToken: 'token-1',
});

describe('CalDAVClient — CTag/ETag fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateAccount.mockResolvedValue({
      serverUrl: 'https://caldav.example.com',
      accountType: 'caldav',
      rootUrl: 'https://caldav.example.com/',
      principalUrl: 'https://caldav.example.com/principal/',
      homeUrl: 'https://caldav.example.com/calendars/user/',
    } as Awaited<ReturnType<typeof createAccount>>);
  });

  it('returns no events and preserves stored etags when the calendar CTag is unchanged', async () => {
    mockFetchCalendars.mockResolvedValue([buildLegacyCalendar('ctag-v1')]);

    const client = buildClient();

    const previousEtags = {
      [FIRST_HREF]: '"etag-1"',
      [SECOND_HREF]: '"etag-2"',
    };

    const result = await client.getEvents({
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      syncCursor: {
        syncTokens: {},
        ctags: { [CALENDAR_URL]: 'ctag-v1' },
        etags: { [CALENDAR_URL]: previousEtags },
      },
    });

    expect(result.events).toEqual([]);
    expect(result.syncCursor.ctags).toEqual({ [CALENDAR_URL]: 'ctag-v1' });
    expect(result.syncCursor.etags).toEqual({ [CALENDAR_URL]: previousEtags });
    expect(mockPropfind).not.toHaveBeenCalled();
    expect(mockCalendarMultiGet).not.toHaveBeenCalled();
  });

  it('fetches every event on the first sync when no etags are stored', async () => {
    mockFetchCalendars.mockResolvedValue([buildLegacyCalendar('ctag-v1')]);

    mockPropfind.mockResolvedValue([
      {
        href: FIRST_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: { getetag: '"etag-1"' },
      },
      {
        href: SECOND_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: { getetag: '"etag-2"' },
      },
    ]);

    mockCalendarMultiGet.mockResolvedValue([
      {
        href: FIRST_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: {
          getetag: '"etag-1"',
          calendarData: buildICalData('uid-1', 'Event One'),
        },
      },
      {
        href: SECOND_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: {
          getetag: '"etag-2"',
          calendarData: buildICalData('uid-2', 'Event Two'),
        },
      },
    ]);

    const client = buildClient();

    const result = await client.getEvents({
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      syncCursor: { syncTokens: {} },
    });

    expect(result.events.map((event) => event.iCalUid).sort()).toEqual([
      'uid-1',
      'uid-2',
    ]);
    expect(result.events.every((event) => !event.isCanceled)).toBe(true);
    expect(result.syncCursor.ctags).toEqual({ [CALENDAR_URL]: 'ctag-v1' });
    expect(result.syncCursor.etags).toEqual({
      [CALENDAR_URL]: {
        [FIRST_HREF]: '"etag-1"',
        [SECOND_HREF]: '"etag-2"',
      },
    });
    expect(mockCalendarMultiGet).toHaveBeenCalledTimes(1);
    expect(mockCalendarMultiGet).toHaveBeenCalledWith(
      expect.objectContaining({
        url: CALENDAR_URL,
        objectUrls: [FIRST_HREF, SECOND_HREF],
      }),
    );
  });

  it('only fetches changed hrefs and emits cancelled stub events for vanished hrefs when CTag differs', async () => {
    mockFetchCalendars.mockResolvedValue([buildLegacyCalendar('ctag-v2')]);

    mockPropfind.mockResolvedValue([
      {
        href: FIRST_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: { getetag: '"etag-1-updated"' },
      },
    ]);

    mockCalendarMultiGet.mockResolvedValue([
      {
        href: FIRST_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: {
          getetag: '"etag-1-updated"',
          calendarData: buildICalData('uid-1', 'Event One Updated'),
        },
      },
    ]);

    const client = buildClient();

    const result = await client.getEvents({
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      syncCursor: {
        syncTokens: {},
        ctags: { [CALENDAR_URL]: 'ctag-v1' },
        etags: {
          [CALENDAR_URL]: {
            [FIRST_HREF]: '"etag-1"',
            [SECOND_HREF]: '"etag-2"',
          },
        },
      },
    });

    const liveEvents = result.events.filter((event) => !event.isCanceled);
    const cancelledEvents = result.events.filter((event) => event.isCanceled);

    expect(liveEvents.map((event) => event.iCalUid)).toEqual(['uid-1']);
    expect(cancelledEvents.map((event) => event.id)).toEqual([SECOND_HREF]);
    expect(cancelledEvents[0].status).toBe('CANCELLED');
    expect(result.syncCursor.ctags).toEqual({ [CALENDAR_URL]: 'ctag-v2' });
    expect(result.syncCursor.etags).toEqual({
      [CALENDAR_URL]: { [FIRST_HREF]: '"etag-1-updated"' },
    });
    expect(mockCalendarMultiGet).toHaveBeenCalledWith(
      expect.objectContaining({
        url: CALENDAR_URL,
        objectUrls: [FIRST_HREF],
      }),
    );
  });

  it('treats a numeric CTag as an opaque string so SabreDAV-style sequence numbers still trigger the unchanged-calendar skip', async () => {
    mockFetchCalendars.mockResolvedValue([
      {
        url: CALENDAR_URL,
        components: ['VEVENT'],
        reports: [],
        ctag: 1004 as unknown as string,
      },
    ]);

    const client = buildClient();

    const result = await client.getEvents({
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      syncCursor: {
        syncTokens: {},
        ctags: { [CALENDAR_URL]: '1004' },
        etags: { [CALENDAR_URL]: { [FIRST_HREF]: '"keep"' } },
      },
    });

    expect(result.events).toEqual([]);
    expect(result.syncCursor.ctags).toEqual({ [CALENDAR_URL]: '1004' });
    expect(mockPropfind).not.toHaveBeenCalled();
  });

  it('takes the sync-collection branch when the calendar advertises it', async () => {
    mockFetchCalendars.mockResolvedValue([buildSyncCollectionCalendar()]);

    mockSyncCollection.mockResolvedValue([
      {
        href: FIRST_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: { getetag: '"etag-1"' },
      },
    ]);

    mockCalendarMultiGet.mockResolvedValue([
      {
        href: FIRST_HREF,
        status: 207,
        statusText: 'OK',
        ok: true,
        props: {
          getetag: '"etag-1"',
          calendarData: buildICalData('uid-1', 'Event One'),
        },
      },
    ]);

    const client = buildClient();

    const result = await client.getEvents({
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
    });

    expect(mockSyncCollection).toHaveBeenCalledTimes(1);
    expect(mockPropfind).not.toHaveBeenCalled();
    expect(result.events.map((event) => event.iCalUid)).toEqual(['uid-1']);
  });
});
