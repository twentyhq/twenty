import psl from 'psl';
import { isParsedDomain } from 'src/modules/contact-creation-manager/types/is-psl-parsed-domain.type';
import { capitalize } from 'twenty-shared/utils';

export const getCompanyNameFromDomainName = (domainName: string) => {
  const result = psl.parse(domainName);

  if (!isParsedDomain(result)) {
    return '';
  }

  return result.sld ? capitalize(result.sld) : '';
};
