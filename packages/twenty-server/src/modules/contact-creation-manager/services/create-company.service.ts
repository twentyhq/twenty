import { Injectable } from '@nestjs/common';

import axios, { type AxiosInstance } from 'axios';
import uniqBy from 'lodash.uniqby';
import { TWENTY_COMPANIES_BASE_URL } from 'twenty-shared/constants';
import {
  type ConnectedAccountProvider,
  type FieldActorSource,
} from 'twenty-shared/types';
import {
  isDefined,
  lowercaseUrlOriginAndRemoveTrailingSlash,
} from 'twenty-shared/utils';
import { type DeepPartial, ILike } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';
import { getCompanyNameFromDomainName } from 'src/modules/contact-creation-manager/utils/get-company-name-from-domain-name.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { computeDisplayName } from 'src/utils/compute-display-name';

export type CompanyToCreate = {
  domainName: string | undefined;
  createdBySource: FieldActorSource;
  createdByWorkspaceMember?: WorkspaceMemberWorkspaceEntity | null;
  createdByContext: {
    provider: ConnectedAccountProvider;
  };
};

@Injectable()
export class CreateCompanyService {
  private readonly httpService: AxiosInstance;

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {
    this.httpService = axios.create({
      baseURL: TWENTY_COMPANIES_BASE_URL,
    });
  }

  async createOrRestoreCompanies(
    companies: CompanyToCreate[],
    workspaceId: string,
  ): Promise<{
    [domainName: string]: string;
  }> {
    if (companies.length === 0) {
      return {};
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const companyRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            CompanyWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        const companiesWithoutTrailingSlash = companies.map((company) => ({
          ...company,
          domainName: company.domainName
            ? lowercaseUrlOriginAndRemoveTrailingSlash(company.domainName)
            : undefined,
        }));

        const uniqueCompanies = uniqBy(
          companiesWithoutTrailingSlash,
          'domainName',
        );
        const conditions = uniqueCompanies.map((companyToCreate) => ({
          domainName: {
            primaryLinkUrl: ILike(`%${companyToCreate.domainName}%`),
          },
        }));

        const existingCompanies = await companyRepository.find({
          where: conditions,
          withDeleted: true,
        });
        const existingCompanyIdsMap = this.createCompanyMap(existingCompanies);

        const newCompaniesToCreate = uniqueCompanies.filter(
          (company) =>
            !existingCompanies.some(
              (existingCompany) =>
                existingCompany.domainName &&
                extractDomainFromLink(
                  existingCompany.domainName.primaryLinkUrl,
                ) === company.domainName,
            ),
        );

        const companiesToRestore = this.filterCompaniesToRestore(
          uniqueCompanies,
          existingCompanies,
        );

        if (
          newCompaniesToCreate.length === 0 &&
          companiesToRestore.length === 0
        ) {
          return existingCompanyIdsMap;
        }

        let lastCompanyPosition =
          await this.getLastCompanyPosition(companyRepository);
        const newCompaniesData = await Promise.all(
          newCompaniesToCreate.map((company) =>
            this.prepareCompanyData(company, ++lastCompanyPosition),
          ),
        );

        const createdCompanies = await companyRepository.save(newCompaniesData);

        const restoredCompanies = await companyRepository.updateMany(
          companiesToRestore.map((company) => {
            return {
              criteria: company.id,
              partialEntity: {
                deletedAt: null,
              },
            };
          }),
          undefined,
          ['domainNamePrimaryLinkUrl', 'id'],
        );

        const formattedRestoredCompanies = restoredCompanies.raw.map(
          (row: { id: string; domainNamePrimaryLinkUrl: string }) => {
            return {
              id: row.id,
              domainName: {
                primaryLinkUrl: row.domainNamePrimaryLinkUrl,
              },
            };
          },
        );

        return {
          ...existingCompanyIdsMap,
          ...(createdCompanies.length > 0
            ? this.createCompanyMap(createdCompanies)
            : {}),
          ...(formattedRestoredCompanies.length > 0
            ? this.createCompanyMap(formattedRestoredCompanies)
            : {}),
        };
      },
    );
  }

  private filterCompaniesToRestore(
    uniqueCompanies: CompanyToCreate[],
    existingCompanies: CompanyWorkspaceEntity[],
  ) {
    return uniqueCompanies
      .map((company) => {
        const existingCompany = existingCompanies.find(
          (existingCompany) =>
            existingCompany.domainName &&
            extractDomainFromLink(existingCompany.domainName.primaryLinkUrl) ===
              company.domainName,
        );

        return isDefined(existingCompany)
          ? {
              domainName: company.domainName,
              id: existingCompany.id,
              deletedAt: null,
            }
          : undefined;
      })
      .filter(isDefined);
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
        context: {
          provider: company.createdByContext.provider,
        },
      },
      address: {
        addressCity: city,
      },
      position,
    };
  }

  private createCompanyMap(
    companies: Pick<CompanyWorkspaceEntity, 'id' | 'domainName'>[],
  ) {
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
  ): Promise<number> {
    const lastCompanyPosition = await companyRepository.maximum(
      'position',
      undefined,
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
    } catch {
      return {
        name: getCompanyNameFromDomainName(domainName ?? ''),
        city: '',
      };
    }
  }
}
