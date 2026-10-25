import { getUrlSafely } from '@/utils/getUrlSafely';
import { isDefined } from '@/utils/validation/isDefined';

const HTTP_PROTOCOLS = ['http:', 'https:'];

export const isHttpUrl = (url: string): boolean => {
  const protocol = getUrlSafely(url)?.protocol;

  return isDefined(protocol) && HTTP_PROTOCOLS.includes(protocol);
};
