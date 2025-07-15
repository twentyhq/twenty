import { safeNewUrl } from '@/utils/safeNewUrl';
import { isDefined } from '@/utils/validation';

export const lowercaseUrlOriginAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = safeNewUrl(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  const lowercaseOrigin = url.origin.toLowerCase();
  const path = url.pathname + url.search + url.hash;

  return (lowercaseOrigin + path).replace(/\/$/, '');
};
