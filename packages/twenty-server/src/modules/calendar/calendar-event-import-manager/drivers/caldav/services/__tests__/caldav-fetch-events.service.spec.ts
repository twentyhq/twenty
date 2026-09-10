import { type DAVClient, type DAVResponse } from 'tsdav';

import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';

const CALENDAR_URL = 'https://caldav.example.com/calendars/user/personal/';
const FIRST_EVENT_HREF = '/calendars/user/personal/first.ics';
const SECOND_EVENT_HREF = '/calendars/user/personal/second.ics';
const CTAG = '17964947537939';

const collectionResponse: DAVResponse = {
  href: '/calendars/user/personal/',
  status: 207,
  statusText: 'Multi-Status',
  ok: true,
};

const createClient = (propfindResponses: DAVResponse[], ctag = CTAG) => {
  const propfind = jest.fn().mockResolvedValue(propfindResponses);

  const client = {
    fetchCalendars: jest.fn().mockResolvedValue([
      {
        url: CALENDAR_URL,
        components: ['VEVENT'],
        reports: [],
        ctag,
      },
    ]),
    propfind,
  } as unknown as DAVClient;

  return { client, propfind };
};

const eventResponse = (
  href: string,
  props: Record<string, unknown>,
): DAVResponse => ({
  href,
  status: 207,
  statusText: 'Multi-Status',
  ok: true,
  props,
});

describe('CalDavFetchEventsService', () => {
  let service: CalDavFetchEventsService;

  beforeEach(() => {
    service = new CalDavFetchEventsService();
  });

  describe('fetchChangedEventHrefs on a calendar without sync-collection', () => {
    it('imports every event when the server omits getetag entirely', async () => {
      const { client } = createClient([
        collectionResponse,
        eventResponse(FIRST_EVENT_HREF, {}),
        eventResponse(SECOND_EVENT_HREF, {}),
      ]);

      const result = await service.fetchChangedEventHrefs(client);

      expect(result.changedHrefs).toEqual([
        FIRST_EVENT_HREF,
        SECOND_EVENT_HREF,
      ]);
      expect(result.cancelledHrefs).toEqual([]);
    });

    it('imports every event when the server returns an empty getetag', async () => {
      const { client } = createClient([
        collectionResponse,
        eventResponse(FIRST_EVENT_HREF, { getetag: '' }),
        eventResponse(SECOND_EVENT_HREF, { getetag: '' }),
      ]);

      const result = await service.fetchChangedEventHrefs(client);

      expect(result.changedHrefs).toEqual([
        FIRST_EVENT_HREF,
        SECOND_EVENT_HREF,
      ]);
    });

    it('imports every event when the server returns a getetag', async () => {
      const { client } = createClient([
        collectionResponse,
        eventResponse(FIRST_EVENT_HREF, { getetag: '"one"' }),
        eventResponse(SECOND_EVENT_HREF, { getetag: '"two"' }),
      ]);

      const result = await service.fetchChangedEventHrefs(client);

      expect(result.changedHrefs).toEqual([
        FIRST_EVENT_HREF,
        SECOND_EVENT_HREF,
      ]);
      expect(result.syncCursor.etags?.[CALENDAR_URL]).toEqual({
        [FIRST_EVENT_HREF]: '"one"',
        [SECOND_EVENT_HREF]: '"two"',
      });
    });

    it('reports no change on a second sync of an unchanged etag-less calendar', async () => {
      const responses = [
        collectionResponse,
        eventResponse(FIRST_EVENT_HREF, {}),
        eventResponse(SECOND_EVENT_HREF, {}),
      ];
      const { client } = createClient(responses);

      const firstSync = await service.fetchChangedEventHrefs(client);
      const secondSync = await service.fetchChangedEventHrefs(
        client,
        firstSync.syncCursor,
      );

      expect(secondSync.changedHrefs).toEqual([]);
      expect(secondSync.cancelledHrefs).toEqual([]);
    });

    it('re-imports etag-less events once the collection ctag moves', async () => {
      const responses = [
        collectionResponse,
        eventResponse(FIRST_EVENT_HREF, {}),
        eventResponse(SECOND_EVENT_HREF, {}),
      ];
      const { client: firstClient } = createClient(responses);
      const { client: secondClient } = createClient(responses, '17964947537940');

      const firstSync = await service.fetchChangedEventHrefs(firstClient);
      const secondSync = await service.fetchChangedEventHrefs(
        secondClient,
        firstSync.syncCursor,
      );

      expect(secondSync.changedHrefs).toEqual([
        FIRST_EVENT_HREF,
        SECOND_EVENT_HREF,
      ]);
    });

    it('prefers getlastmodified over the collection ctag to detect an in-place edit', async () => {
      const { client: firstClient } = createClient([
        collectionResponse,
        eventResponse(FIRST_EVENT_HREF, {
          getlastmodified: 'Tue, 01 Sep 2026 10:00:00 GMT',
        }),
        eventResponse(SECOND_EVENT_HREF, {
          getlastmodified: 'Tue, 01 Sep 2026 10:00:00 GMT',
        }),
      ]);
      const { client: secondClient } = createClient(
        [
          collectionResponse,
          eventResponse(FIRST_EVENT_HREF, {
            getlastmodified: 'Wed, 02 Sep 2026 08:30:00 GMT',
          }),
          eventResponse(SECOND_EVENT_HREF, {
            getlastmodified: 'Tue, 01 Sep 2026 10:00:00 GMT',
          }),
        ],
        '17964947537940',
      );

      const firstSync = await service.fetchChangedEventHrefs(firstClient);
      const secondSync = await service.fetchChangedEventHrefs(
        secondClient,
        firstSync.syncCursor,
      );

      expect(secondSync.changedHrefs).toEqual([FIRST_EVENT_HREF]);
    });

    it('does not cache the ctag when no event resource was collected', async () => {
      const { client, propfind } = createClient([collectionResponse]);

      const firstSync = await service.fetchChangedEventHrefs(client);

      expect(firstSync.syncCursor.ctags?.[CALENDAR_URL]).toBeUndefined();

      await service.fetchChangedEventHrefs(client, firstSync.syncCursor);

      expect(propfind).toHaveBeenCalledTimes(2);
    });
  });
});
