import psl from 'psl';
import { capitalize } from 'twenty-shared';

export const getCompanyNameFromDomainName = (domainName: string) => {
  const { sld } = psl.parse(domainName);

  return sld ? capitalize(sld) : '';
};
