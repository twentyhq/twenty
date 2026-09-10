import { resolveCalDavResourceEtag } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/resolve-caldav-resource-etag.util';

const href = 'https://caldav.example.com/calendars/user/event.ics';

describe('resolveCalDavResourceEtag', () => {
  it('uses the etag advertised by the server', () => {
    expect(
      resolveCalDavResourceEtag({
        etag: '"abc123"',
        lastModified: 'Tue, 01 Sep 2026 10:00:00 GMT',
        ctag: '17964947537939',
        href,
      }),
    ).toBe('"abc123"');
  });

  it.each([undefined, '', {}])(
    'falls back to the last modified date when the etag is %p',
    (etag) => {
      expect(
        resolveCalDavResourceEtag({
          etag,
          lastModified: 'Tue, 01 Sep 2026 10:00:00 GMT',
          ctag: '17964947537939',
          href,
        }),
      ).toBe('Tue, 01 Sep 2026 10:00:00 GMT');
    },
  );

  it('falls back to a collection-scoped value when the server supplies neither', () => {
    expect(
      resolveCalDavResourceEtag({
        etag: undefined,
        lastModified: undefined,
        ctag: '17964947537939',
        href,
      }),
    ).toBe(`${href}:17964947537939`);
  });

  it('changes when the collection ctag changes so in-place edits are re-fetched', () => {
    const before = resolveCalDavResourceEtag({
      etag: undefined,
      lastModified: undefined,
      ctag: '17964947537939',
      href,
    });
    const after = resolveCalDavResourceEtag({
      etag: undefined,
      lastModified: undefined,
      ctag: '17964947537940',
      href,
    });

    expect(after).not.toBe(before);
  });

  it('distinguishes two resources sharing the same ctag', () => {
    const otherHref = 'https://caldav.example.com/calendars/user/other.ics';

    expect(
      resolveCalDavResourceEtag({
        etag: undefined,
        lastModified: undefined,
        ctag: '17964947537939',
        href,
      }),
    ).not.toBe(
      resolveCalDavResourceEtag({
        etag: undefined,
        lastModified: undefined,
        ctag: '17964947537939',
        href: otherHref,
      }),
    );
  });

  it('falls back to the href when the server supplies no change signal at all', () => {
    expect(
      resolveCalDavResourceEtag({
        etag: undefined,
        lastModified: undefined,
        ctag: undefined,
        href,
      }),
    ).toBe(href);
  });
});
