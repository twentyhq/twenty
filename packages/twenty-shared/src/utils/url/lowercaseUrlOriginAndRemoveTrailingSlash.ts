import { getURLSafely } from '../getURLSafely';
import { isDefined } from '../validation/isDefined';

export const lowercaseUrlOriginAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = getURLSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  const lowercaseOrigin = url.origin.toLowerCase();
  const path = url.pathname + url.search + url.hash;

  return (lowercaseOrigin + path).replace(/\/$/, '');
};
