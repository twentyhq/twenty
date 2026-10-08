import { isSameCalDavResource } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-same-caldav-resource.util';

describe('isSameCalDavResource', () => {
  const collectionUrl = 'https://caldav.example.com/calendars/user/work/';

  it.each([
    'https://caldav.example.com/calendars/user/work/',
    'https://caldav.example.com/calendars/user/work',
    'https://caldav.example.com/calendars/user/work/?foo=bar',
    'https://caldav.example.com/calendars/user/work/#section',
    '/calendars/user/work/',
    '/calendars/user/work',
  ])('resolves %s to the same resource', (href) => {
    expect(isSameCalDavResource(href, collectionUrl)).toBe(true);
  });

  it.each([
    'https://caldav.example.com/calendars/user/work/event.ics',
    'https://caldav.example.com/calendars/user/work/attachments/',
    'https://caldav.example.com/calendars/user/personal/',
    'https://other.example.com/calendars/user/work/',
    '/calendars/user/work/event.ics',
  ])('resolves %s to a different resource', (href) => {
    expect(isSameCalDavResource(href, collectionUrl)).toBe(false);
  });

  it.each(['http://[', 'https://%%', 'http://host name/calendar/'])(
    'treats the unparseable href %s as a different resource',
    (href) => {
      expect(isSameCalDavResource(href, collectionUrl)).toBe(false);
    },
  );

  it('treats an unparseable collection url as a different resource', () => {
    expect(isSameCalDavResource('/calendars/user/work/', 'not a url')).toBe(
      false,
    );
  });

  it('resolves percent-encoded and decoded paths to the same resource', () => {
    expect(
      isSameCalDavResource(
        '/calendars/user/My Calendar/',
        'https://caldav.example.com/calendars/user/My%20Calendar/',
      ),
    ).toBe(true);
  });
});
