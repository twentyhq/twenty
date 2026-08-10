import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type DAVCalendar,
  type DAVClient,
  type DAVResponse,
  DAVNamespace,
  DAVNamespaceShort,
  getDAVAttribute,
} from 'tsdav';
import { isDefined } from 'twenty-shared/utils';

import { type CalDavSyncCursor } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-sync-cursor';
import { extractICalData } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/extract-ical-data.util';
import { isEventInTimeRange } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-event-in-time-range.util';
import { isInvalidSyncTokenResponse } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-invalid-sync-token-response.util';
import { isValidCalDavHref } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-valid-caldav-href.util';
import { mapCalDavStatusToExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/map-caldav-status-to-exception-code.util';
import { parseICalEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-ical-event.util';
import { CalendarEventImportDriverException } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

type CalendarSyncResult = {
  calendarUrl: string;
  changedHrefs: string[];
  cancelledHrefs: string[];
  newSyncToken?: string;
  newCtag?: string;
  newEtags?: Record<string, string>;
};

@Injectable()
export class CalDavFetchEventsService {
  private readonly logger = new Logger(CalDavFetchEventsService.name);

  private static readonly PAST_DAYS_WINDOW = 365 * 5;
  private static readonly FUTURE_DAYS_WINDOW = 365;

  async listEventCalendars(client: DAVClient): Promise<DAVCalendar[]> {
    const calendars = await client.fetchCalendars();

    return calendars.filter((calendar) =>
      calendar.components?.includes('VEVENT'),
    );
  }

  async fetchChangedEventHrefs(
    client: DAVClient,
    syncCursor?: CalDavSyncCursor,
  ): Promise<{
    changedHrefs: string[];
    cancelledHrefs: string[];
    syncCursor: CalDavSyncCursor;
  }> {
    const calendars = await this.listEventCalendars(client);

    const results = await Promise.all(
      calendars.map((calendar) =>
        this.syncCalendar(client, calendar, syncCursor),
      ),
    );

    return {
      changedHrefs: results.flatMap((result) => result.changedHrefs),
      cancelledHrefs: results.flatMap((result) => result.cancelledHrefs),
      syncCursor: this.mergeSyncCursor(results),
    };
  }

  async fetchEventsByHrefs(
    client: DAVClient,
    eventHrefs: string[],
  ): Promise<FetchedCalendarEvent[]> {
    if (eventHrefs.length === 0) return [];

    const startDate = new Date(
      Date.now() -
        CalDavFetchEventsService.PAST_DAYS_WINDOW * 24 * 60 * 60 * 1000,
    );
    const endDate = new Date(
      Date.now() +
        CalDavFetchEventsService.FUTURE_DAYS_WINDOW * 24 * 60 * 60 * 1000,
    );

    const collectionUrls = [
      ...new Set(
        eventHrefs.map((href) => this.resolveCollectionUrl(client, href)),
      ),
    ];

    const calendarObjects = (
      await Promise.all(
        collectionUrls.map((collectionUrl) =>
          this.fetchCalendarObjects(
            client,
            collectionUrl,
            eventHrefs.filter(
              (href) =>
                this.resolveCollectionUrl(client, href) === collectionUrl,
            ),
          ),
        ),
      )
    ).flat();

    return calendarObjects.flatMap((calendarObject) => {
      const iCalData = extractICalData(calendarObject.props?.calendarData);

      if (!isNonEmptyString(calendarObject.href) || !iCalData) return [];

      return parseICalEvents(iCalData, calendarObject.href).filter((event) =>
        isEventInTimeRange(event, startDate, endDate),
      );
    });
  }

  private async fetchCalendarObjects(
    client: DAVClient,
    collectionUrl: string,
    objectUrls: string[],
  ): Promise<DAVResponse[]> {
    const responses = await client.davRequest({
      url: collectionUrl,
      init: {
        method: 'REPORT',
        namespace: DAVNamespaceShort.CALDAV,
        headers: { depth: '1' },
        body: {
          'calendar-multiget': {
            _attributes: getDAVAttribute([
              DAVNamespace.DAV,
              DAVNamespace.CALDAV,
            ]),
            [`${DAVNamespaceShort.DAV}:prop`]: {
              [`${DAVNamespaceShort.DAV}:getetag`]: {},
              [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
            },
            [`${DAVNamespaceShort.DAV}:href`]: objectUrls,
          },
        },
      },
    });

    const unreadableResponses = responses.filter(
      (response) => isDefined(response.status) && response.status >= 400,
    );

    const failedRequest = unreadableResponses.find((response) =>
      this.isCollectionResponse(response, collectionUrl),
    );

    if (isDefined(failedRequest)) {
      throw new CalendarEventImportDriverException(
        `calendar-multiget on ${collectionUrl} failed: ${failedRequest.status} ${failedRequest.statusText}`,
        mapCalDavStatusToExceptionCode(failedRequest.status),
      );
    }

    const removedResponses = unreadableResponses.filter(
      (response) => response.status === 404 || response.status === 410,
    );
    const unexpectedResponses = unreadableResponses.filter(
      (response) => response.status !== 404 && response.status !== 410,
    );

    if (removedResponses.length > 0) {
      this.logger.debug(
        `Skipping ${removedResponses.length} calendar events removed from ${collectionUrl} since the last list fetch`,
      );
    }

    if (unexpectedResponses.length > 0) {
      this.logger.warn(
        `Skipping ${unexpectedResponses.length} unreadable calendar events in ${collectionUrl}: ${unexpectedResponses
          .map((response) => `${response.href} ${response.status}`)
          .join(', ')}`,
      );
    }

    return responses.filter(
      (response) => !isDefined(response.status) || response.status < 400,
    );
  }

  private isCollectionResponse(
    response: DAVResponse,
    collectionUrl: string,
  ): boolean {
    if (!isNonEmptyString(response.href)) {
      return true;
    }

    return (
      new URL(response.href, collectionUrl).href === new URL(collectionUrl).href
    );
  }

  private resolveCollectionUrl(client: DAVClient, href: string): string {
    const collectionPath = href.slice(0, href.lastIndexOf('/') + 1);

    return new URL(collectionPath, client.serverUrl).href;
  }

  private async syncCalendar(
    client: DAVClient,
    calendar: DAVCalendar,
    syncCursor?: CalDavSyncCursor,
  ): Promise<CalendarSyncResult> {
    const supportsSyncCollection =
      calendar.reports?.includes('syncCollection') ?? false;

    try {
      return supportsSyncCollection
        ? await this.fetchHrefsViaSyncCollection(client, calendar, syncCursor)
        : await this.fetchHrefsViaCtagEtag(client, calendar, syncCursor);
    } catch (error) {
      this.logger.error(`Per-calendar sync failed for ${calendar.url}`, error);

      return {
        calendarUrl: calendar.url,
        changedHrefs: [],
        cancelledHrefs: [],
        newSyncToken: syncCursor?.syncTokens[calendar.url],
        newCtag: syncCursor?.ctags?.[calendar.url],
        newEtags: syncCursor?.etags?.[calendar.url],
      };
    }
  }

  private async fetchHrefsViaSyncCollection(
    client: DAVClient,
    calendar: DAVCalendar,
    syncCursor?: CalDavSyncCursor,
  ): Promise<CalendarSyncResult> {
    const previousSyncToken = syncCursor?.syncTokens[calendar.url];

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

    const rawSyncToken = syncResult[0]?.raw?.multistatus?.syncToken;
    const newSyncToken = isDefined(rawSyncToken)
      ? String(rawSyncToken)
      : previousSyncToken;

    return {
      calendarUrl: calendar.url,
      changedHrefs,
      cancelledHrefs,
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

  private async fetchHrefsViaCtagEtag(
    client: DAVClient,
    calendar: DAVCalendar,
    syncCursor?: CalDavSyncCursor,
  ): Promise<CalendarSyncResult> {
    const storedEtags = syncCursor?.etags?.[calendar.url] ?? {};
    const newCtag = isDefined(calendar.ctag)
      ? String(calendar.ctag)
      : undefined;
    const storedCtag = syncCursor?.ctags?.[calendar.url];

    if (isDefined(newCtag) && isDefined(storedCtag) && newCtag === storedCtag) {
      return {
        calendarUrl: calendar.url,
        changedHrefs: [],
        cancelledHrefs: [],
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

    return {
      calendarUrl: calendar.url,
      changedHrefs,
      cancelledHrefs,
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
}
