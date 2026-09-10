import { isValidHostname } from '@/utils/url/isValidHostname';
import { normalizeDomain } from '@/utils/url/normalizeDomain';

export const isValidDomain = (rawDomain: string): boolean =>
  isValidHostname(normalizeDomain(rawDomain), {
    allowLocalhost: false,
    allowIp: false,
  });
