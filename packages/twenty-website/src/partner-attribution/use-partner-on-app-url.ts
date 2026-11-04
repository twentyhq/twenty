import { useSyncExternalStore } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SITE_URLS } from '@/platform/site-urls';

import { readSavedPartner } from './read-saved-partner';

const APP_HOSTNAME = new URL(SITE_URLS.appWelcome).hostname;

const subscribe = () => () => {};

const readSavedPartnerSafely = (): string | null => {
  try {
    return readSavedPartner({ storage: localStorage, now: Date.now() });
  } catch {
    return null;
  }
};

const setPartnerOnAppUrl = (href: string, partner: string): string => {
  try {
    const url = new URL(href);

    if (url.hostname !== APP_HOSTNAME) {
      return href;
    }

    url.searchParams.set('via', partner);

    return url.toString();
  } catch {
    return href;
  }
};

export const usePartnerOnAppUrl = (
  href: string | undefined,
): string | undefined => {
  const partner = useSyncExternalStore(
    subscribe,
    readSavedPartnerSafely,
    () => null,
  );

  return isDefined(href) && isDefined(partner)
    ? setPartnerOnAppUrl(href, partner)
    : href;
};
