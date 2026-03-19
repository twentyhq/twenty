import { getURLSafely } from '@/utils/getURLSafely';
import { isDefined } from '@/utils/validation';

export const lowercaseUrlOriginAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = getURLSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  const lowercaseOrigin = url.origin.toLowerCase();
  // Use pathname/search as-is to preserve percent-encoding (e.g. %2F must not
  // become / inside Google Maps data= params or similar structured URL paths).
  const path = url.pathname + url.search + url.hash;

  return (lowercaseOrigin + path).replace(/\/$/, '');
};
