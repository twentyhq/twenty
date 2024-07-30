import { isDefined } from 'class-validator';

// temporary, to remove once domainName has been fully migrated to Links type
export const getCompanyDomainName = (company: any) => {
  if (!isDefined(company.domainName)) {
    return company.domainName;
  }
  if (typeof company.domainName === 'string') {
    return company.domainName;
  } else {
    return company.domainName.primaryLinkUrl;
  }
};
