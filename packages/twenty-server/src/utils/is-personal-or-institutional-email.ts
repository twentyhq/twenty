import { emailProvidersSet } from 'src/utils/email-providers';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { universityDomainsSet } from 'src/utils/university-domains';

export const isPersonalOrInstitutionalDomain = (domain: string) =>
  emailProvidersSet.has(domain) || universityDomainsSet.has(domain);

export const isPersonalOrInstitutionalEmail = (email: string) => {
  try {
    return isPersonalOrInstitutionalDomain(getDomainNameByEmail(email));
  } catch {
    return false;
  }
};
