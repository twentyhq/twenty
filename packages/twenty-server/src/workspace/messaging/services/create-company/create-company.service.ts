import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { CompanyService } from 'src/workspace/messaging/repositories/company/company.service';
@Injectable()
export class CreateCompanyService {
  constructor(private readonly companyService: CompanyService) {}

  async createCompanies(
    domainNames: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<{
    [domainName: string]: string;
  }> {
    const uniqueDomainNames = [...new Set(domainNames)];

    const existingCompanies =
      await this.companyService.getExistingCompaniesByDomainNames(
        uniqueDomainNames,
        workspaceId,
        transactionManager,
      );

    const companiesObject = existingCompanies.reduce(
      (
        acc: {
          [domainName: string]: string;
        },
        company: {
          domainName: string;
          id: string;
        },
      ) => ({
        ...acc,
        [company.domainName]: company.id,
      }),
      {},
    );

    const filteredDomainNames = uniqueDomainNames.filter(
      (domainName) =>
        !existingCompanies.some(
          (company: { domainName: string }) =>
            company.domainName === domainName,
        ),
    );

    for (const domainName of filteredDomainNames) {
      companiesObject[domainName] = await this.companyService.createCompany(
        domainName,
        workspaceId,
        transactionManager,
      );
    }

    return companiesObject;
  }
}
