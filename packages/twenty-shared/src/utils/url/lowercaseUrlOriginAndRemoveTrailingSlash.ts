import { getURLSafely } from '@/utils/getURLSafely';
import { isDefined } from '@/utils/validation';

export const lowercaseUrlOriginAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = getURLSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  // Skip URLs with opaque origins (e.g., file:, data:, mailto:), which have
  // url.origin === "null". For these, return the original URL unmodified to
  // avoid generating "null/..." URLs or changing opaque URI semantics.
  if (url.origin === 'null') {
    return rawUrl;
  }

  // Only process HTTP(S) URLs. Other non-opaque schemes (e.g., blob:, ftp:)
  // could have a valid origin but different URL structure, so return unmodified.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return rawUrl;
  }

  const lowercaseOrigin = url.origin.toLowerCase();

  const protocolIndex = rawUrl.indexOf('://');
  if (protocolIndex === -1) {
    return rawUrl;
  }

  let endOfHost = rawUrl.length;
  const forwardSlashIndex = rawUrl.indexOf('/', protocolIndex + 3);
  const backslashIndex = rawUrl.indexOf('\\', protocolIndex + 3);
  const pathStartIndex =
    forwardSlashIndex === -1
      ? backslashIndex
      : backslashIndex === -1
        ? forwardSlashIndex
        : Math.min(forwardSlashIndex, backslashIndex);
  const queryStartIndex = rawUrl.indexOf('?', protocolIndex + 3);
  const hashStartIndex = rawUrl.indexOf('#', protocolIndex + 3);

  if (pathStartIndex !== -1) endOfHost = Math.min(endOfHost, pathStartIndex);
  if (queryStartIndex !== -1) endOfHost = Math.min(endOfHost, queryStartIndex);
  if (hashStartIndex !== -1) endOfHost = Math.min(endOfHost, hashStartIndex);

  const rawSuffix = rawUrl.substring(endOfHost);

  return (lowercaseOrigin + rawSuffix).replace(/\/$/, '');
};
