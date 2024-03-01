import { capitalize } from 'src/utils/capitalize';

export const getCompanyNameFromDomainName = (domainName: string): string => {
  return capitalize(domainName.split('.').slice(-2, -1)[0]);
};
