import { getUrlSafely } from '@/utils/getUrlSafely';
import { isDefined } from '@/utils/validation';

export const normalizeAllowedIframeOrigin = (
  value: string,
): string | undefined => {
  if (value.length > 300 || /[\s*\\]/.test(value)) {
    return undefined;
  }

  const url = getUrlSafely(value);

  if (
    !isDefined(url) ||
    !['https:', 'http:'].includes(url.protocol) ||
    !/^https?:\/\/[^/?#@]+\/?$/i.test(value) ||
    !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(
      url.hostname,
    ) ||
    url.username !== '' ||
    url.password !== '' ||
    url.pathname !== '/' ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    return undefined;
  }

  return url.origin;
};
