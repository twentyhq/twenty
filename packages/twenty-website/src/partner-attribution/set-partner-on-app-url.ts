import { SITE_URLS } from '@/platform/site-urls';

const APP_HOSTNAME = new URL(SITE_URLS.appWelcome).hostname;

export const setPartnerOnAppUrl = ({
  href,
  partner,
}: {
  href: string;
  partner: string;
}): string => {
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
