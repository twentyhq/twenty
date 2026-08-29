import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type AxiosInstance } from 'axios';
import uniqBy from 'lodash.uniqby';
import { TWENTY_COMPANIES_BASE_URL } from 'twenty-shared/constants';
import {
  type ConnectedAccountProvider,
  type FieldActorSource,
} from 'twenty-shared/types';
import { isDefined, normalizeDomain } from 'twenty-shared/utils';
import { type DeepPartial, In } from 'typeorm';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { getCompanyNameFromDomainName } from 'src/modules/contact-creation-manager/utils/get-company-name-from-domain-name.util';
import { getDomainNamesFromLinks } from 'src/modules/contact-creation-manager/utils/get-domain-names-from-links.util';
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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {
    this.httpService = this.secureHttpClientService.getHttpClient({
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

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const companyRepository = this.workspaceOrmManager.getRepository(
        CompanyWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

      const normalizedCompanies = companies.map((company) => ({
        ...company,
        domainName: company.domainName
          ? normalizeDomain(company.domainName)
          : undefined,
      }));

      const uniqueCompanies = uniqBy(normalizedCompanies, 'domainName');

      const domainNames = uniqueCompanies
        .map((companyToCreate) => companyToCreate.domainName)
        .filter(isNonEmptyString);

      if (domainNames.length === 0) {
        return {};
      }

      const companiesMatchedOnPrimaryLink = await companyRepository.find({
        where: {
          domainName: {
            primaryLinkUrl: In(domainNames),
          },
        },
        withDeleted: true,
      });

      const domainNamesWithoutLiveCompany = domainNames.filter(
        (domainName) =>
          !isDefined(
            this.findExistingCompanyByDomainName({
              existingCompanies: companiesMatchedOnPrimaryLink.filter(
                (company) => !isDefined(company.deletedAt),
              ),
              domainName,
            }),
          ),
      );

      const companiesMatchedOnSecondaryLinks =
        await this.findCompaniesBySecondaryDomainNames({
          domainNames: domainNamesWithoutLiveCompany,
        });

      const companyIdsMatchedOnPrimaryLink = new Set(
        companiesMatchedOnPrimaryLink.map((company) => company.id),
      );

      const matchedCompanies = [
        ...companiesMatchedOnPrimaryLink,
        ...companiesMatchedOnSecondaryLinks.filter(
          (company) => !companyIdsMatchedOnPrimaryLink.has(company.id),
        ),
      ];

      const existingCompanies = [
        ...matchedCompanies.filter((company) => !isDefined(company.deletedAt)),
        ...matchedCompanies.filter((company) => isDefined(company.deletedAt)),
      ];

      const existingCompanyIdsMap = this.createCompanyMap(existingCompanies);

      const newCompaniesToCreate = uniqueCompanies.filter(
        (company) =>
          !isDefined(
            this.findExistingCompanyByDomainName({
              existingCompanies,
              domainName: company.domainName,
            }),
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
    }, authContext);
  }

  private async findCompaniesBySecondaryDomainNames({
    domainNames,
  }: {
    domainNames: string[];
  }): Promise<CompanyWorkspaceEntity[]> {
    if (domainNames.length === 0) {
      return [];
    }

    const companyRepository = this.workspaceOrmManager.getRepository(
      CompanyWorkspaceEntity,
      {
        shouldBypassPermissionChecks: true,
      },
    );

    const containmentConditions = domainNames
      .map(
        (_, index) =>
          `"company"."domainNameSecondaryLinks" @> CAST(:secondaryLink${index} AS jsonb)`,
      )
      .join(' OR ');

    const containmentParameters = Object.fromEntries(
      domainNames.map((domainName, index) => [
        `secondaryLink${index}`,
        JSON.stringify([{ url: domainName }]),
      ]),
    );

    return companyRepository
      .createQueryBuilder('company')
      .where(containmentConditions, containmentParameters)
      .withDeleted()
      .getMany();
  }

  private findExistingCompanyByDomainName({
    existingCompanies,
    domainName,
  }: {
    existingCompanies: CompanyWorkspaceEntity[];
    domainName: string | undefined;
  }): CompanyWorkspaceEntity | undefined {
    if (!isNonEmptyString(domainName)) {
      return undefined;
    }

    return existingCompanies.find((existingCompany) =>
      getDomainNamesFromLinks(existingCompany.domainName).includes(domainName),
    );
  }

  private filterCompaniesToRestore(
    uniqueCompanies: CompanyToCreate[],
    existingCompanies: CompanyWorkspaceEntity[],
  ) {
    return uniqueCompanies
      .map((company) => {
        const existingCompany = this.findExistingCompanyByDomainName({
          existingCompanies,
          domainName: company.domainName,
        });

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
        primaryLinkUrl: company.domainName ?? '',
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
        if (!company.id) {
          return acc;
        }

        for (const domainName of getDomainNamesFromLinks(company.domainName)) {
          if (!isDefined(acc[domainName])) {
            acc[domainName] = company.id;
          }
        }

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
