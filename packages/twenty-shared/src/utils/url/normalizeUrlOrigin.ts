import { isNonEmptyString } from '@sniptt/guards';

import { getUrlSafely } from '@/utils/getUrlSafely';
import { isDefined } from '@/utils/validation';

// Only strips a trailing slash: URL() already lowercases the origin and preserves percent-encoded sequences elsewhere.
export const normalizeUrlOrigin = (rawUrl: string) => {
  const url = getUrlSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  const href = url.origin + url.pathname + url.search + url.hash;
  const hasQueryOrHash =
    isNonEmptyString(url.search) || isNonEmptyString(url.hash);

  if (hasQueryOrHash) {
    return href;
  }

  return href.replace(/\/$/, '');
};
