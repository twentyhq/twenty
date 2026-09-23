import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { type DAVResponse } from 'tsdav';

import { CALDAV_UNVERSIONED_RESOURCE } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/constants/caldav-unversioned-resource.constant';

const readTag = (value: unknown): string | undefined => {
  if (isNonEmptyString(value)) {
    return value;
  }

  if (isNumber(value) && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
};

export const resolveCalDavResourceVersion = (
  response: Pick<DAVResponse, 'props'>,
): string =>
  readTag(response.props?.getetag) ??
  readTag(response.props?.getlastmodified) ??
  CALDAV_UNVERSIONED_RESOURCE;
