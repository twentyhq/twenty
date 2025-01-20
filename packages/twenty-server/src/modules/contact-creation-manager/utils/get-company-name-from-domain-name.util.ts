import { capitalize } from '@twenty/shared';
import psl from 'psl';

export const getCompanyNameFromDomainName = (domainName: string) => {
  const { sld } = psl.parse(domainName);

  return sld ? capitalize(sld) : '';
};
