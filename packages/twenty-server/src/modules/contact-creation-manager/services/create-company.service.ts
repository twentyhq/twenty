import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';
import uniqBy from 'lodash.uniqby';
import { TWENTY_COMPANIES_BASE_URL } from 'twenty-shared';
import { DeepPartial, EntityManager, ILike } from 'typeorm';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';
import { getCompanyNameFromDomainName } from 'src/modules/contact-creation-manager/utils/get-company-name-from-domain-name.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { computeDisplayName } from 'src/utils/compute-display-name';

type CompanyToCreate = {
  domainName: string | undefined;
  createdBySource: FieldActorSource;
  createdByWorkspaceMember?: WorkspaceMemberWorkspaceEntity | null;
};

@Injectable()
export class CreateCompanyService {
  private readonly httpService: AxiosInstance;

  constructor(private readonly twentyORMGlobalManager: TwentyORMGlobalManager) {
    this.httpService = axios.create({
      baseURL: TWENTY_COMPANIES_BASE_URL,
    });
  }

  async createCompanies(
    companies: CompanyToCreate[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<{
    [domainName: string]: string;
  }> {
    if (companies.length === 0) {
      return {};
    }

    const companyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        CompanyWorkspaceEntity,
      );

    // Avoid creating duplicate companies
    const uniqueCompanies = uniqBy(companies, 'domainName');
    const conditions = uniqueCompanies.map((companyToCreate) => ({
      domainName: {
        primaryLinkUrl: ILike(`%${companyToCreate.domainName}%`),
      },
    }));

    // Find existing companies
    const existingCompanies = await companyRepository.find(
      {
        where: conditions,
      },
      transactionManager,
    );
    const existingCompanyIdsMap = this.createCompanyMap(existingCompanies);

    // Filter out companies that already exist
    const newCompaniesToCreate = uniqueCompanies.filter(
      (company) =>
        !existingCompanies.some(
          (existingCompany) =>
            existingCompany.domainName &&
            extractDomainFromLink(existingCompany.domainName.primaryLinkUrl) ===
              company.domainName,
        ),
    );

    if (newCompaniesToCreate.length === 0) {
      return existingCompanyIdsMap;
    }

    // Retrieve the last company position
    let lastCompanyPosition = await this.getLastCompanyPosition(
      companyRepository,
      transactionManager,
    );
    const newCompaniesData = await Promise.all(
      newCompaniesToCreate.map((company) =>
        this.prepareCompanyData(company, ++lastCompanyPosition),
      ),
    );

    // Create new companies
    const createdCompanies = await companyRepository.save(newCompaniesData);
    const createdCompanyIdsMap = this.createCompanyMap(createdCompanies);

    return {
      ...existingCompanyIdsMap,
      ...createdCompanyIdsMap,
    };
  }

  async createCompany(
    company: CompanyToCreate,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<string> {
    const companyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        CompanyWorkspaceEntity,
      );
    let lastCompanyPosition = await this.getLastCompanyPosition(
      companyRepository,
      transactionManager,
    );

    const data = await this.prepareCompanyData(company, ++lastCompanyPosition);

    const createdCompany = await companyRepository.save(
      data,
      undefined,
      transactionManager,
    );

    return createdCompany.id;
  }

  private async prepareCompanyData(
    company: CompanyToCreate,
    position: number,
  ): Promise<DeepPartial<CompanyWorkspaceEntity>> {
    const { name, city } = await this.getCompanyInfoFromDomainName(
      company.domainName,
    );
    const createdByName = computeDisplayName(
      company.createdByWorkspaceMember?.name,
    );

    return {
      domainName: {
        primaryLinkUrl: 'https://' + company.domainName,
      },
      name,
      createdBy: {
        source: company.createdBySource,
        workspaceMemberId: company.createdByWorkspaceMember?.id,
        name: createdByName,
      },
      address: {
        addressCity: city,
      },
      position,
    };
  }

  private createCompanyMap(companies: DeepPartial<CompanyWorkspaceEntity>[]) {
    return companies.reduce(
      (acc, company) => {
        if (!company.domainName?.primaryLinkUrl || !company.id) {
          return acc;
        }
        const key = extractDomainFromLink(company.domainName.primaryLinkUrl);

        acc[key] = company.id;

        return acc;
      },
      {} as { [domainName: string]: string },
    );
  }

  private async getLastCompanyPosition(
    companyRepository: WorkspaceRepository<CompanyWorkspaceEntity>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const lastCompanyPosition = await companyRepository.maximum(
      'position',
      undefined,
      transactionManager,
    );

    return lastCompanyPosition ?? 0;
  }

  private async getCompanyInfoFromDomainName(
    domainName: string | undefined,
  ): Promise<{
    name: string;
    city: string;
  }> {
    try {
      const response = await this.httpService.get(`/${domainName}`);

      const data = response.data;

      return {
        name: data.name ?? getCompanyNameFromDomainName(domainName ?? ''),
        city: data.city,
      };
    } catch (e) {
      return {
        name: getCompanyNameFromDomainName(domainName ?? ''),
        city: '',
      };
    }
  }
}
