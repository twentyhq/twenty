import psl from 'psl';

import { capitalize } from 'src/utils/capitalize';

export const getCompanyNameFromDomainName = (domainName: string) => {
  const { sld } = psl.parse(domainName);

  return sld ? capitalize(sld) : '';
};
