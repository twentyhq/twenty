import { SUBDOMAIN_PATTERN } from '@/constants/SubdomainPattern';

export const isValidTwentySubdomain = (subdomain: string): boolean => {
  return SUBDOMAIN_PATTERN.test(subdomain);
};
