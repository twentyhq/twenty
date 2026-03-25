import { emailProvidersSet } from 'src/utils/email-providers';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export const isWorkEmail = (email: string) => {
  try {
    return !emailProvidersSet.has(getDomainNameByEmail(email));
  } catch {
    return false;
  }
};

export const isWorkDomain = (domain: string) => {
  return !emailProvidersSet.has(domain);
};
