// @ts-expect-error legacy noImplicitAny
import psl from 'psl';
import { capitalize } from 'twenty-shared/utils';

export const getCompanyNameFromDomainName = (domainName: string) => {
  const { sld } = psl.parse(domainName);

  return sld ? capitalize(sld) : '';
};
