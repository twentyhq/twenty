import psl from 'psl';

import { capitalize } from 'src/utils/capitalize';

export const getDomainNameFromHandle = (handle: string): string => {
  const wholeDomain = handle?.split('@')?.[1] || '';

  const { domain } = psl.parse(wholeDomain);

  return domain || '';
};

export function getCompanyNameAndDomainNameFromHandle(handle: string) {
  const wholeDomain = handle?.split('@')?.[1];

  const { domain, sld } = psl.parse(wholeDomain);

  return {
    domainName: domain || '',
    companyName: sld ? capitalize(sld) : '',
  };
}
