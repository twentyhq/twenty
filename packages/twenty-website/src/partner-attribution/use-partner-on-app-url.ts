import { useSyncExternalStore } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SITE_URLS } from '@/platform/site-urls';

import { readSavedPartner } from './partner-storage';

const APP_HOSTNAME = new URL(SITE_URLS.appWelcome).hostname;

const subscribe = () => () => {};

const setPartnerOnAppUrl = (href: string, partner: string): string => {
  try {
    const url = new URL(href);

    if (url.hostname !== APP_HOSTNAME) {
      return href;
    }

    url.searchParams.set('partner', partner);

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
    () => readSavedPartner(),
    () => null,
  );

  return isDefined(href) && isDefined(partner)
    ? setPartnerOnAppUrl(href, partner)
    : href;
};
