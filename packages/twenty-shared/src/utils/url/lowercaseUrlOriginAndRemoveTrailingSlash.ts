import { getURLSafely } from '@/utils/getURLSafely';
import { isDefined } from '@/utils/validation';

export const lowercaseUrlOriginAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = getURLSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  // Only HTTP(S) URLs have a meaningful origin for this transformation.
  // For other protocols (e.g., file:, data:), return the original URL
  // with any trailing slash removed to avoid generating "null/..." URLs.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return rawUrl.replace(/\/$/, '');
  }

  const lowercaseOrigin = url.origin.toLowerCase();

  const protocolIndex = rawUrl.indexOf('://');
  if (protocolIndex === -1) {
    return rawUrl;
  }

  let endOfHost = rawUrl.length;
  const pathStartIndex = rawUrl.indexOf('/', protocolIndex + 3);
  const queryStartIndex = rawUrl.indexOf('?', protocolIndex + 3);
  const hashStartIndex = rawUrl.indexOf('#', protocolIndex + 3);

  if (pathStartIndex !== -1) endOfHost = Math.min(endOfHost, pathStartIndex);
  if (queryStartIndex !== -1) endOfHost = Math.min(endOfHost, queryStartIndex);
  if (hashStartIndex !== -1) endOfHost = Math.min(endOfHost, hashStartIndex);

  const rawSuffix = rawUrl.substring(endOfHost);

  return (lowercaseOrigin + rawSuffix).replace(/\/$/, '');
};
