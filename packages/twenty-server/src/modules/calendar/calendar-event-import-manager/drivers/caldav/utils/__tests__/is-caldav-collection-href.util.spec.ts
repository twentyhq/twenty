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
    'https://caldav.example.com/calendars/user/work/event.ics',
    'https://caldav.example.com/calendars/user/work/event.eml',
    'https://caldav.example.com/calendars/user/work/event-without-extension',
    '/calendars/user/work/event.ics',
  ])('does not identify event href %s as collection', (href) => {
    expect(isCalDavCollectionHref(href, collectionUrl)).toBe(false);
  });
});
