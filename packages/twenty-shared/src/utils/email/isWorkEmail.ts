import { isNonEmptyString } from '@sniptt/guards';

import { getDomainFromEmail } from '@/utils/email/getDomainFromEmail';
import { isWorkDomain } from '@/utils/email/isWorkDomain';

export const isWorkEmail = (email: string): boolean => {
  const domain = getDomainFromEmail(email);

  return isNonEmptyString(domain) && isWorkDomain(domain);
};
