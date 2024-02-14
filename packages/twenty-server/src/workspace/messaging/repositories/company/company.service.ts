import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import axios, { AxiosInstance } from 'axios';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { capitalize } from 'src/utils/capitalize';

// TODO: Move outside of the messaging module
@Injectable()
export class CompanyService {
  private readonly httpService: AxiosInstance;

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    this.httpService = axios.create({
      baseURL: 'https://companies.twenty.com',
    });
  }

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

  async createCompany(
    domainName: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<string> {
    const companyId = v4();

    const { name, city } = await this.getCompanyInfoFromDomainName(domainName);

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}.company (id, name, "domainName", address)
      VALUES ($1, $2, $3, $4)`,
      [companyId, name, domainName, city],
      workspaceId,
      transactionManager,
    );

    return companyId;
  }

  async getCompanyInfoFromDomainName(domainName: string): Promise<{
    name: string;
    city: string;
  }> {
    try {
      const response = await this.httpService.get(`/${domainName}`);

      const data = response.data;

      return {
        name: data.name,
        city: data.city,
      };
    } catch (e) {
      return {
        name: capitalize(domainName.split('.')[0]),
        city: '',
      };
    }
  }
}
