import { getURLSafely } from '@/utils/getURLSafely';
import { isDefined } from '@/utils/validation';
import { safeDecodeURIComponent } from './safeDecodeURIComponent';

export const lowercaseUrlOriginAndRemoveTrailingSlash = (rawUrl: string) => {
  const url = getURLSafely(rawUrl);

  if (!isDefined(url)) {
    return rawUrl;
  }

  const lowercaseOrigin = url.origin.toLowerCase();
  const path =
    safeDecodeURIComponent(url.pathname) +
    safeDecodeURIComponent(url.search) +
    url.hash;

  return (lowercaseOrigin + path).replace(/\/$/, '');
};
