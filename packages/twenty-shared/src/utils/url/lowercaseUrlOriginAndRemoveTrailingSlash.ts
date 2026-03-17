import { getURLSafely } from '@/utils/getURLSafely';
import { isDefined } from '@/utils/validation';

export const lowercaseUrlOriginAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = getURLSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
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

  const rawPath = rawUrl.substring(endOfHost);

  return (lowercaseOrigin + rawPath).replace(/\/$/, '');
};
