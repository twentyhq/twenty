import { isNonEmptyString } from '@sniptt/guards';

import { emailProvidersSet } from 'src/utils/email-providers';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

export const isWorkEmail = (email: string) => {
  const domain = getDomainFromEmail(email);

  return isNonEmptyString(domain) && !emailProvidersSet.has(domain);
};

export const isWorkDomain = (domain: string) => {
  return !emailProvidersSet.has(domain);
};
