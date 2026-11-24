import { NEWLINE_SEPARATED_EMAIL_PROVIDER_DOMAINS } from '@/constants/EmailProviderDomains';

let emailProviderDomains: Set<string> | undefined;

export const isWorkDomain = (domain: string): boolean => {
  // Built on first call so a bundle that never calls this can drop the list.
  emailProviderDomains ??= new Set(
    NEWLINE_SEPARATED_EMAIL_PROVIDER_DOMAINS.split('\n'),
  );

  return !emailProviderDomains.has(domain);
};
