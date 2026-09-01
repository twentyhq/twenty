import { isSameCalDavResource } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-same-caldav-resource.util';

export const isCalDavCollectionHref = (
  href: string,
  collectionUrl: string,
): boolean =>
  new URL(href, collectionUrl).pathname.endsWith('/') ||
  isSameCalDavResource(href, collectionUrl);
