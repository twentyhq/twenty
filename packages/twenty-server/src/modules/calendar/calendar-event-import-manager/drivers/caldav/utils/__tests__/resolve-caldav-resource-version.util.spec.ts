import { CALDAV_UNVERSIONED_RESOURCE } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/constants/caldav-unversioned-resource.constant';
import { resolveCalDavResourceVersion } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/resolve-caldav-resource-version.util';

describe('resolveCalDavResourceVersion', () => {
  it('uses the entity tag when the server supplies one', () => {
    expect(
      resolveCalDavResourceVersion({
        props: {
          getetag: '"fffff-abcd3"',
          getlastmodified: 'Wed, 15 Nov 2023 10:00:00 GMT',
        },
      }),
    ).toBe('"fffff-abcd3"');
  });

  it('stringifies an unquoted numeric entity tag', () => {
    expect(resolveCalDavResourceVersion({ props: { getetag: 17964947 } })).toBe(
      '17964947',
    );
  });

  it('falls back to the last modified date when the entity tag is empty', () => {
    expect(
      resolveCalDavResourceVersion({
        props: {
          getetag: {},
          getlastmodified: 'Wed, 15 Nov 2023 10:00:00 GMT',
        },
      }),
    ).toBe('Wed, 15 Nov 2023 10:00:00 GMT');
  });

  it('falls back to the last modified date when the entity tag is missing', () => {
    expect(
      resolveCalDavResourceVersion({
        props: { getlastmodified: 'Wed, 15 Nov 2023 10:00:00 GMT' },
      }),
    ).toBe('Wed, 15 Nov 2023 10:00:00 GMT');
  });

  it('marks the resource unversioned when the server supplies neither', () => {
    expect(resolveCalDavResourceVersion({ props: { getetag: '' } })).toBe(
      CALDAV_UNVERSIONED_RESOURCE,
    );
  });

  it('marks the resource unversioned when no properties came back at all', () => {
    expect(resolveCalDavResourceVersion({ props: undefined })).toBe(
      CALDAV_UNVERSIONED_RESOURCE,
    );
  });
});
