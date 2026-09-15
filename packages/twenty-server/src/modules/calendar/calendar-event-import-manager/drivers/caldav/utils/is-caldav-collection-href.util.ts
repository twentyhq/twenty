import { isDefined } from 'twenty-shared/utils';

import { isSameCalDavResource } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/is-same-caldav-resource.util';

export const isCalDavCollectionHref = (
  href: string,
  collectionUrl: string,
): boolean => {
  const resolvedHref = URL.parse(href, collectionUrl);

  if (!isDefined(resolvedHref)) {
    return false;
  }

  return (
    resolvedHref.pathname.endsWith('/') ||
    isSameCalDavResource(href, collectionUrl)
  );
};
