import { isDefined } from 'twenty-shared/utils';

import { SITE_URLS } from '@/platform/site-urls';

const APP_HOSTNAME = new URL(SITE_URLS.appWelcome).hostname;

export const setPartnerOnAppUrl = ({
  href,
  partner,
}: {
  href: string;
  partner: string | undefined;
}): string => {
  try {
    const url = new URL(href);

    if (url.hostname !== APP_HOSTNAME) {
      return href;
    }

    if (isDefined(partner)) {
      url.searchParams.set('partner', partner);
    } else {
      url.searchParams.delete('partner');
    }

    return url.toString();
  } catch {
    return href;
  }
};
