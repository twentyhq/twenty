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
    transactionManager?: EntityManager,
  ): Promise<{ id: string; domainName: string }[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const existingCompanies =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT id, "domainName" FROM ${dataSourceSchema}.company WHERE "domainName" = ANY($1)`,
        [domainNames],
        workspaceId,
        transactionManager,
      );

    return existingCompanies;
  }

  public async createCompany(
    workspaceId: string,
    companyToCreate: CompanyToCreate,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}.company (id, "domainName", name, address)
      VALUES ($1, $2, $3, $4)`,
      [
        companyToCreate.id,
        companyToCreate.domainName,
        companyToCreate.name ?? '',
        companyToCreate.city ?? '',
      ],
      workspaceId,
      transactionManager,
    );
  }
}
