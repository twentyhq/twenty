import { getURLSafely } from '@/utils/getURLSafely';
import { isDefined } from '@/utils/validation';

// Lowercases the URL origin (scheme + host) and removes a trailing slash.
// URL() already lowercases the origin and preserves percent-encoded sequences
// in the path, query, and hash (e.g. %2F stays %2F, %2520 stays %2520).
export const normalizeUrlOrigin = (rawUrl: string) => {
  const url = getURLSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  return (url.origin + url.pathname + url.search + url.hash).replace(/\/$/, '');
};
