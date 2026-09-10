import { type DAVResponse } from 'tsdav';

import { CALDAV_UNVERSIONED_RESOURCE } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/constants/caldav-unversioned-resource.constant';
import { resolveCalDavResourceVersion } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/resolve-caldav-resource-version.util';

const buildResponse = (props: DAVResponse['props']): DAVResponse => ({
  href: 'https://caldav.example.com/calendars/user/event.ics',
  status: 207,
  statusText: 'Multi-Status',
  ok: true,
  props,
});

describe('resolveCalDavResourceVersion', () => {
  it('uses the entity tag when the server supplies one', () => {
    expect(
      resolveCalDavResourceVersion(
        buildResponse({
          getetag: '"fffff-abcd3"',
          getlastmodified: 'Wed, 15 Nov 2023 10:00:00 GMT',
        }),
      ),
    ).toBe('"fffff-abcd3"');
  });

  it('stringifies an unquoted numeric entity tag', () => {
    expect(
      resolveCalDavResourceVersion(buildResponse({ getetag: 17964947 })),
    ).toBe('17964947');
  });

  it('falls back to the last modified date when the entity tag is empty', () => {
    expect(
      resolveCalDavResourceVersion(
        buildResponse({
          getetag: {},
          getlastmodified: 'Wed, 15 Nov 2023 10:00:00 GMT',
        }),
      ),
    ).toBe('Wed, 15 Nov 2023 10:00:00 GMT');
  });

  it('falls back to the last modified date when the entity tag is missing', () => {
    expect(
      resolveCalDavResourceVersion(
        buildResponse({ getlastmodified: 'Wed, 15 Nov 2023 10:00:00 GMT' }),
      ),
    ).toBe('Wed, 15 Nov 2023 10:00:00 GMT');
  });

  it('marks the resource unversioned when the server supplies neither', () => {
    expect(resolveCalDavResourceVersion(buildResponse({ getetag: '' }))).toBe(
      CALDAV_UNVERSIONED_RESOURCE,
    );
  });

  it('marks the resource unversioned when no properties came back at all', () => {
    expect(resolveCalDavResourceVersion(buildResponse(undefined))).toBe(
      CALDAV_UNVERSIONED_RESOURCE,
    );
  });
});
