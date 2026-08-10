import { isNonEmptyString } from '@sniptt/guards';
import {
  type DAVClient,
  type DAVResponse,
  DAVNamespace,
  DAVNamespaceShort,
  getDAVAttribute,
} from 'tsdav';
import { isDefined } from 'twenty-shared/utils';

import { mapCalDavStatusToExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/map-caldav-status-to-exception-code.util';
import { CalendarEventImportDriverException } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

type RunCalendarMultiGetParams = {
  client: DAVClient;
  collectionUrl: string;
  objectUrls: string[];
};

type CalendarMultiGetResult = {
  objects: DAVResponse[];
  missingHrefs: string[];
};

const isSuccessStatus = (status: number | undefined): boolean =>
  !isDefined(status) || (status >= 200 && status < 300);

// tsdav only populates `props` for entries parsed out of a DAV:multistatus body, so an entry
// without it is tsdav reporting the REPORT request itself failing rather than a per-resource status.
const isMultiStatusMember = (response: DAVResponse): boolean =>
  isDefined(response.props);

// RFC 4791 section 7.9 requires the server to answer a calendar-multiget REPORT with a per-href
// DAV:status, so hrefs deleted between the list-fetch and the import step legitimately come back
// as 404 inside a 207 Multi-Status. tsdav's `calendarMultiGet` runs through `collectionQuery`,
// which throws on the first member with a >=400 status and takes the whole batch down with it,
// so the REPORT is issued through `davRequest` (what tsdav's own `syncCollection` uses) instead.
export const runCalendarMultiGet = async ({
  client,
  collectionUrl,
  objectUrls,
}: RunCalendarMultiGetParams): Promise<CalendarMultiGetResult> => {
  if (objectUrls.length === 0) {
    return { objects: [], missingHrefs: [] };
  }

  const responses = await client.davRequest({
    url: collectionUrl,
    init: {
      method: 'REPORT',
      namespace: DAVNamespaceShort.CALDAV,
      headers: { depth: '1' },
      body: {
        'calendar-multiget': {
          _attributes: getDAVAttribute([DAVNamespace.DAV, DAVNamespace.CALDAV]),
          [`${DAVNamespaceShort.DAV}:prop`]: {
            [`${DAVNamespaceShort.DAV}:getetag`]: {},
            [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {},
          },
          [`${DAVNamespaceShort.DAV}:href`]: objectUrls,
        },
      },
    },
  });

  const requestFailure = responses.find(
    (response) =>
      !isMultiStatusMember(response) && !isSuccessStatus(response.status),
  );

  if (isDefined(requestFailure)) {
    throw new CalendarEventImportDriverException(
      `calendar-multiget on ${collectionUrl} failed: ${requestFailure.status} ${requestFailure.statusText}`,
      mapCalDavStatusToExceptionCode(requestFailure.status),
    );
  }

  return responses.reduce<CalendarMultiGetResult>(
    (result, response) => {
      if (isSuccessStatus(response.status)) {
        result.objects.push(response);
      } else if (isNonEmptyString(response.href)) {
        result.missingHrefs.push(response.href);
      }

      return result;
    },
    { objects: [], missingHrefs: [] },
  );
};
