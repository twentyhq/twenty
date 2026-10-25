import { getUrlSafely } from '@/utils/getUrlSafely';

const HTTP_PROTOCOLS = ['http:', 'https:'];

export const isHttpUrl = (url: string): boolean => {
  const protocol = getUrlSafely(url)?.protocol;

  return protocol !== undefined && HTTP_PROTOCOLS.includes(protocol);
};
