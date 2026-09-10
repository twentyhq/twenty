import { Test, type TestingModule } from '@nestjs/testing';
import {
  type DAVCalendar,
  type DAVClient,
  type DAVResponse,
  DAVNamespaceShort,
} from 'tsdav';

import { CalDavFetchEventsService } from './caldav-fetch-events.service';

const davResponse = (
  response: Pick<DAVResponse, 'href' | 'props'> &
    Partial<Pick<DAVResponse, 'status'>>,
): DAVResponse => ({
  status: 200,
  statusText: 'OK',
  ok: true,
  ...response,
});

describe('CalDavFetchEventsService', () => {
  let service: CalDavFetchEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalDavFetchEventsService],
    }).compile();

    service = module.get<CalDavFetchEventsService>(CalDavFetchEventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncCalendar via fetchHrefsViaCtagEtag', () => {
    const mockCalendar: DAVCalendar = {
      url: 'https://caldav.example.com/calendars/user/default/',
      ctag: 'ctag-1',
      reports: [],
      components: ['VEVENT'],
    };

    it('falls back to href as pseudo-etag when getetag is missing or empty (e.g. SmarterMail)', async () => {
      const mockResponses: DAVResponse[] = [
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/',
          props: {},
        }),
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/event-no-etag.ics',
          props: {},
        }),
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/event-empty-etag.ics',
          props: { getetag: '' },
        }),
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/event-with-etag.ics',
          props: { getetag: '"real-etag-123"' },
        }),
      ];

      const mockClient = {
        propfind: jest.fn().mockResolvedValue(mockResponses),
      } as unknown as DAVClient;

      const result = await (service as any).syncCalendar(
        mockClient,
        mockCalendar,
      );

      expect(mockClient.propfind).toHaveBeenCalledWith({
        url: mockCalendar.url,
        props: { [`${DAVNamespaceShort.DAV}:getetag`]: {} },
        depth: '1',
      });

      // Events without getetag must not be dropped; they should fall back to href as pseudo-etag
      expect(result.changedHrefs).toEqual([
        'https://caldav.example.com/calendars/user/default/event-no-etag.ics',
        'https://caldav.example.com/calendars/user/default/event-empty-etag.ics',
        'https://caldav.example.com/calendars/user/default/event-with-etag.ics',
      ]);
      expect(result.cancelledHrefs).toEqual([]);
      expect(result.newCtag).toBe('ctag-1');
      expect(result.newEtags).toEqual({
        'https://caldav.example.com/calendars/user/default/event-no-etag.ics':
          'https://caldav.example.com/calendars/user/default/event-no-etag.ics',
        'https://caldav.example.com/calendars/user/default/event-empty-etag.ics':
          'https://caldav.example.com/calendars/user/default/event-empty-etag.ics',
        'https://caldav.example.com/calendars/user/default/event-with-etag.ics':
          '"real-etag-123"',
      });
    });

    it('ignores collection href and non-caldav file extensions', async () => {
      const mockResponses: DAVResponse[] = [
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/',
          props: {},
        }),
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/readme.txt',
          props: {},
        }),
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/valid-event.ics',
          props: {},
        }),
      ];

      const mockClient = {
        propfind: jest.fn().mockResolvedValue(mockResponses),
      } as unknown as DAVClient;

      const result = await (service as any).syncCalendar(
        mockClient,
        mockCalendar,
      );

      expect(result.changedHrefs).toEqual([
        'https://caldav.example.com/calendars/user/default/valid-event.ics',
      ]);
    });

    it('short-circuits when ctag is unchanged', async () => {
      const storedEtags = {
        'https://caldav.example.com/calendars/user/default/event1.ics':
          'https://caldav.example.com/calendars/user/default/event1.ics',
      };
      const syncCursor = {
        syncTokens: {},
        ctags: { [mockCalendar.url]: 'ctag-1' },
        etags: { [mockCalendar.url]: storedEtags },
      };

      const mockClient = {
        propfind: jest.fn(),
      } as unknown as DAVClient;

      const result = await (service as any).syncCalendar(
        mockClient,
        mockCalendar,
        syncCursor,
      );

      expect(mockClient.propfind).not.toHaveBeenCalled();
      expect(result.changedHrefs).toEqual([]);
      expect(result.cancelledHrefs).toEqual([]);
      expect(result.newCtag).toBe('ctag-1');
      expect(result.newEtags).toEqual(storedEtags);
    });

    it('detects new and cancelled events when ctag changes on server without getetag', async () => {
      const storedEtags = {
        'https://caldav.example.com/calendars/user/default/kept-event.ics':
          'https://caldav.example.com/calendars/user/default/kept-event.ics',
        'https://caldav.example.com/calendars/user/default/deleted-event.ics':
          'https://caldav.example.com/calendars/user/default/deleted-event.ics',
      };
      const syncCursor = {
        syncTokens: {},
        ctags: { [mockCalendar.url]: 'ctag-1' },
        etags: { [mockCalendar.url]: storedEtags },
      };

      const updatedCalendar: DAVCalendar = {
        ...mockCalendar,
        ctag: 'ctag-2',
      };

      const mockResponses: DAVResponse[] = [
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/kept-event.ics',
          props: {},
        }),
        davResponse({
          href: 'https://caldav.example.com/calendars/user/default/new-event.ics',
          props: {},
        }),
      ];

      const mockClient = {
        propfind: jest.fn().mockResolvedValue(mockResponses),
      } as unknown as DAVClient;

      const result = await (service as any).syncCalendar(
        mockClient,
        updatedCalendar,
        syncCursor,
      );

      expect(result.changedHrefs).toEqual([
        'https://caldav.example.com/calendars/user/default/new-event.ics',
      ]);
      expect(result.cancelledHrefs).toEqual([
        'https://caldav.example.com/calendars/user/default/deleted-event.ics',
      ]);
      expect(result.newCtag).toBe('ctag-2');
    });
  });

  describe('fetchChangedEventHrefs', () => {
    it('aggregates changed and cancelled hrefs across multiple calendars', async () => {
      const cal1: DAVCalendar = {
        url: 'https://caldav.example.com/cal1/',
        ctag: '1',
        reports: [],
        components: ['VEVENT'],
      };
      const cal2: DAVCalendar = {
        url: 'https://caldav.example.com/cal2/',
        ctag: '1',
        reports: [],
        components: ['VEVENT'],
      };

      const mockClient = {
        fetchCalendars: jest.fn().mockResolvedValue([cal1, cal2]),
        propfind: jest.fn().mockImplementation(({ url }: { url: string }) => {
          if (url === cal1.url) {
            return [
              davResponse({
                href: 'https://caldav.example.com/cal1/event1.ics',
                props: {},
              }),
            ];
          }
          return [
            davResponse({
              href: 'https://caldav.example.com/cal2/event2.ics',
              props: { getetag: '"cal2-etag"' },
            }),
          ];
        }),
      } as unknown as DAVClient;

      const { changedHrefs, cancelledHrefs, syncCursor } =
        await service.fetchChangedEventHrefs(mockClient);

      expect(changedHrefs).toEqual([
        'https://caldav.example.com/cal1/event1.ics',
        'https://caldav.example.com/cal2/event2.ics',
      ]);
      expect(cancelledHrefs).toEqual([]);
      expect(syncCursor.ctags).toEqual({
        'https://caldav.example.com/cal1/': '1',
        'https://caldav.example.com/cal2/': '1',
      });
      expect(syncCursor.etags).toEqual({
        'https://caldav.example.com/cal1/': {
          'https://caldav.example.com/cal1/event1.ics':
            'https://caldav.example.com/cal1/event1.ics',
        },
        'https://caldav.example.com/cal2/': {
          'https://caldav.example.com/cal2/event2.ics': '"cal2-etag"',
        },
      });
    });
  });
});
