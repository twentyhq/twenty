import { emailProvidersSet } from 'src/utils/email-providers';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export const isWorkEmail = (email: string) => {
  try {
    return !emailProvidersSet.has(getDomainNameByEmail(email));
  } catch (err) {
    return false;
  }
};
