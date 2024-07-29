import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

export type CompanyToCreate = {
  id: string;
  domainName: string;
  name?: string;
  city?: string;
};

@Injectable()
export class CompanyRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getExistingCompaniesByDomainNames(
    domainNames: string[],
    workspaceId: string,
    companyDomainNameColumnName: string,
    transactionManager?: EntityManager,
  ): Promise<{ id: string; domainName: string }[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const existingCompanies =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT id, "${companyDomainNameColumnName}" AS "domainName" FROM ${dataSourceSchema}.company WHERE REGEXP_REPLACE("${companyDomainNameColumnName}", '^https?://', '') = ANY($1)`,
        [domainNames],
        workspaceId,
        transactionManager,
      );

    return existingCompanies;
  }

  public async getLastCompanyPosition(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT MAX(position) FROM ${dataSourceSchema}.company`,
      [],
      workspaceId,
      transactionManager,
    );

    return result[0].max ?? 0;
  }

  public async createCompany(
    workspaceId: string,
    companyToCreate: CompanyToCreate,
    companyDomainNameColumnName,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const lastCompanyPosition = await this.getLastCompanyPosition(
      workspaceId,
      transactionManager,
    );

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}.company (id, "${companyDomainNameColumnName}", name, "addressAddressCity", position)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        companyToCreate.id,
        'https://' + companyToCreate.domainName,
        companyToCreate.name ?? '',
        companyToCreate.city ?? '',
        lastCompanyPosition + 1,
      ],
      workspaceId,
      transactionManager,
    );
  }
}
