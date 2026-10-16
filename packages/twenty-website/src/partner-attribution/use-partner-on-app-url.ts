import { useSyncExternalStore } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { readPartnerFromUrl } from './read-partner-from-url';
import { readSavedPartner } from './read-saved-partner';
import { setPartnerOnAppUrl } from './set-partner-on-app-url';

const subscribe = () => () => {};

const readPartner = () => readPartnerFromUrl() ?? readSavedPartner();

export const usePartnerOnAppUrl = (
  href: string | undefined,
): string | undefined => {
  const partner = useSyncExternalStore(subscribe, readPartner, () => undefined);

  return isDefined(href) && isDefined(partner)
    ? setPartnerOnAppUrl({ href, partner })
    : href;
};
