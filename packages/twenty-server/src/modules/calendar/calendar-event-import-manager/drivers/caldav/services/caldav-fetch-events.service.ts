import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type DAVCalendar,
  type DAVClient,
  type DAVResponse,
  DAVNamespaceShort,
} from 'tsdav';
import { isDefined } from 'twenty-shared/utils';

import { type CalDavSyncCursor } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-sync-cursor';
import { buildCancelledCalDavEvent } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/build-cancelled-event.util';
import { extractICalData } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-ical-data.util';
import { isEventInTimeRange } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-event-in-time-range.util';
import { isInvalidSyncTokenResponse } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-invalid-sync-token-response.util';
import { isValidCalDavHref } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-valid-caldav-href.util';
import { parseICalEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-ical-event.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

type CalendarSyncResult = {
  calendarUrl: string;
  events: FetchedCalendarEvent[];
  newSyncToken?: string;
  newCtag?: string;
  newEtags?: Record<string, string>;
};

type FetchEventsOptions = {
  startDate: Date;
  endDate: Date;
  syncCursor?: CalDavSyncCursor;
};

@Injectable()
export class CalDavFetchEventsService {
  private readonly logger = new Logger(CalDavFetchEventsService.name);

  async listEventCalendars(client: DAVClient): Promise<DAVCalendar[]> {
    const calendars = await client.fetchCalendars();

    return calendars.filter((calendar) =>
      calendar.components?.includes('VEVENT'),
    );
  }

  async fetchEvents(
    client: DAVClient,
    options: FetchEventsOptions,
  ): Promise<{ events: FetchedCalendarEvent[]; syncCursor: CalDavSyncCursor }> {
    const calendars = await this.listEventCalendars(client);

    const results = await Promise.all(
      calendars.map((calendar) => this.syncCalendar(client, calendar, options)),
    );

    return {
      events: results.flatMap((result) => result.events),
      syncCursor: this.mergeSyncCursor(results),
    };
  }

  private async syncCalendar(
    client: DAVClient,
    calendar: DAVCalendar,
    options: FetchEventsOptions,
  ): Promise<CalendarSyncResult> {
    const supportsSyncCollection =
      calendar.reports?.includes('syncCollection') ?? false;

    try {
      return supportsSyncCollection
        ? await this.fetchEventsViaSyncCollection(client, calendar, options)
        : await this.fetchEventsViaCtagEtag(client, calendar, options);
    } catch (error) {
      this.logger.error(`Per-calendar sync failed for ${calendar.url}`, error);

      return {
        calendarUrl: calendar.url,
        events: [],
        newSyncToken: options.syncCursor?.syncTokens[calendar.url],
        newCtag: options.syncCursor?.ctags?.[calendar.url],
        newEtags: options.syncCursor?.etags?.[calendar.url],
      };
    }
  }

  private async fetchEventsViaSyncCollection(
    client: DAVClient,
    calendar: DAVCalendar,
    options: FetchEventsOptions,
  ): Promise<CalendarSyncResult> {
    const previousSyncToken = options.syncCursor?.syncTokens[calendar.url];

    const syncResult = await this.runSyncCollection(
      client,
      calendar.url,
      previousSyncToken,
    );

    const memberResponses = syncResult.filter(
      (entry): entry is DAVResponse & { href: string } =>
        isNonEmptyString(entry.href) && isValidCalDavHref(entry.href),
    );

    const changedHrefs = memberResponses
      .filter((entry) => entry.status !== 404)
      .map((entry) => entry.href);
    const cancelledHrefs = memberResponses
      .filter((entry) => entry.status === 404)
      .map((entry) => entry.href);

    const fetchedEvents = await this.fetchAndParseEvents(
      client,
      calendar.url,
      changedHrefs,
      options,
    );

    const rawSyncToken = syncResult[0]?.raw?.multistatus?.syncToken;
    const newSyncToken = isNonEmptyString(rawSyncToken)
      ? rawSyncToken
      : previousSyncToken;

    return {
      calendarUrl: calendar.url,
      events: [
        ...fetchedEvents,
        ...cancelledHrefs.map(buildCancelledCalDavEvent),
      ],
      newSyncToken,
    };
  }

  private async runSyncCollection(
    client: DAVClient,
    url: string,
    previousSyncToken: string | undefined,
  ): Promise<DAVResponse[]> {
    const send = (token: string | undefined) =>
      client.syncCollection({
        url,
        props: {
          [`${DAVNamespaceShort.DAV}:getetag`]: {},
          [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
        },
        syncLevel: 1,
        ...(isNonEmptyString(token) ? { syncToken: token } : {}),
      });

    const result = await send(previousSyncToken);

    if (
      isNonEmptyString(previousSyncToken) &&
      isInvalidSyncTokenResponse(result)
    ) {
      this.logger.warn(
        `Sync-token invalidated for ${url}; falling back to full re-sync`,
      );

      return send(undefined);
    }

    return result;
  }

  private async fetchEventsViaCtagEtag(
    client: DAVClient,
    calendar: DAVCalendar,
    options: FetchEventsOptions,
  ): Promise<CalendarSyncResult> {
    const storedEtags = options.syncCursor?.etags?.[calendar.url] ?? {};
    const newCtag = isDefined(calendar.ctag)
      ? String(calendar.ctag)
      : undefined;
    const storedCtag = options.syncCursor?.ctags?.[calendar.url];

    if (isDefined(newCtag) && isDefined(storedCtag) && newCtag === storedCtag) {
      return {
        calendarUrl: calendar.url,
        events: [],
        newCtag,
        newEtags: storedEtags,
      };
    }

    const currentEtags = await this.fetchEtagsByHref(client, calendar.url);

    const changedHrefs = Object.keys(currentEtags).filter(
      (href) => storedEtags[href] !== currentEtags[href],
    );
    const cancelledHrefs = Object.keys(storedEtags).filter(
      (href) => !(href in currentEtags),
    );

    const fetchedEvents = await this.fetchAndParseEvents(
      client,
      calendar.url,
      changedHrefs,
      options,
    );

    return {
      calendarUrl: calendar.url,
      events: [
        ...fetchedEvents,
        ...cancelledHrefs.map(buildCancelledCalDavEvent),
      ],
      newCtag,
      newEtags: currentEtags,
    };
  }

  private mergeSyncCursor(results: CalendarSyncResult[]): CalDavSyncCursor {
    const syncTokens: Record<string, string> = {};
    const ctags: Record<string, string> = {};
    const etags: Record<string, Record<string, string>> = {};

    for (const result of results) {
      if (result.newSyncToken)
        syncTokens[result.calendarUrl] = result.newSyncToken;
      if (result.newCtag) ctags[result.calendarUrl] = result.newCtag;
      if (result.newEtags) etags[result.calendarUrl] = result.newEtags;
    }

    return {
      syncTokens,
      ctags: Object.keys(ctags).length > 0 ? ctags : undefined,
      etags: Object.keys(etags).length > 0 ? etags : undefined,
    };
  }

  private async fetchEtagsByHref(
    client: DAVClient,
    calendarUrl: string,
  ): Promise<Record<string, string>> {
    const responses = await client.propfind({
      url: calendarUrl,
      props: { [`${DAVNamespaceShort.DAV}:getetag`]: {} },
      depth: '1',
    });

    return responses.reduce<Record<string, string>>((map, response) => {
      const href = response.href;
      const etag = response.props?.getetag;

      if (
        !isNonEmptyString(href) ||
        !isNonEmptyString(etag) ||
        !isValidCalDavHref(href)
      ) {
        return map;
      }

      map[href] = etag;

      return map;
    }, {});
  }

  private async fetchAndParseEvents(
    client: DAVClient,
    calendarUrl: string,
    objectUrls: string[],
    options: { startDate: Date; endDate: Date },
  ): Promise<FetchedCalendarEvent[]> {
    if (objectUrls.length === 0) return [];

    const calendarObjects = await client.calendarMultiGet({
      url: calendarUrl,
      props: {
        [`${DAVNamespaceShort.DAV}:getetag`]: {},
        [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
      },
      objectUrls,
      depth: '1',
    });

    return calendarObjects.flatMap((calendarObject) => {
      const iCalData = extractICalData(calendarObject.props?.calendarData);

      if (!iCalData) return [];

      return parseICalEvents(iCalData, calendarObject.href || '').filter(
        (event) =>
          isEventInTimeRange(event, options.startDate, options.endDate),
      );
    });
  }
}
