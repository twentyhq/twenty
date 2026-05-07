import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { universityDomainsSet } from 'src/utils/university-domains';

export const isInstitutionalDomain = (domain: string) => {
  if (universityDomainsSet.has(domain)) return true;

  const dot = domain.indexOf('.');
  const parent = dot === -1 ? '' : domain.slice(dot + 1);

  return parent.includes('.') && universityDomainsSet.has(parent);
};

export const isInstitutionalEmail = (email: string) => {
  try {
    return isInstitutionalDomain(getDomainNameByEmail(email));
  } catch {
    return false;
  }
};
