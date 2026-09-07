import { isCalDavCollectionHref } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-caldav-collection-href.util';

describe('isCalDavCollectionHref', () => {
  const collectionUrl = 'https://caldav.example.com/calendars/user/work/';

  it.each([
    'https://caldav.example.com/calendars/user/work/',
    'https://caldav.example.com/calendars/user/work',
    'https://caldav.example.com/calendars/user/work/?foo=bar',
    'https://caldav.example.com/calendars/user/work/#section',
    '/calendars/user/work/',
  ])('identifies collection href %s', (href) => {
    expect(isCalDavCollectionHref(href, collectionUrl)).toBe(true);
  });

  it.each([
    'https://caldav.example.com/calendars/user/work/attachments/',
    '/calendars/user/work/attachments/',
    '/calendars/user/work/attachments/nested/',
  ])('identifies contained collection href %s', (href) => {
    expect(isCalDavCollectionHref(href, collectionUrl)).toBe(true);
  });

  it.each([
    'https://caldav.example.com/calendars/user/work/event.ics',
    'https://caldav.example.com/calendars/user/work/event.eml',
    'https://caldav.example.com/calendars/user/work/event-without-extension',
    '/calendars/user/work/event.ics',
    '/calendars/user/work/attachments/event.ics',
  ])('does not identify event href %s as collection', (href) => {
    expect(isCalDavCollectionHref(href, collectionUrl)).toBe(false);
  });

  it.each(['http://[', 'https://%%', 'http://host name/calendar/'])(
    'does not identify the unparseable href %s as collection',
    (href) => {
      expect(isCalDavCollectionHref(href, collectionUrl)).toBe(false);
    },
  );

  it('does not identify an event hosted on another origin as collection', () => {
    expect(
      isCalDavCollectionHref(
        'https://other.example.com/calendars/user/work/event.ics',
        collectionUrl,
      ),
    ).toBe(false);
  });
});
