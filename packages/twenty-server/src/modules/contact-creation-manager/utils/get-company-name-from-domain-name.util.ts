import psl from 'psl';
import { capitalize } from 'twenty-shared/utils';

import { isParsedDomain } from 'src/modules/contact-creation-manager/types/is-psl-parsed-domain.type';

export const getCompanyNameFromDomainName = (domainName: string) => {
  const result = psl.parse(domainName);

  if (!isParsedDomain(result)) {
    return '';
  }

  return result.sld ? capitalize(result.sld) : '';
};
