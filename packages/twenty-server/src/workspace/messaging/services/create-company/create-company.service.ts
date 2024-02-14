import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { v4 } from 'uuid';

import { capitalize } from 'src/utils/capitalize';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
@Injectable()
export class CreateCompanyService {
  private readonly httpService: AxiosInstance;

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    this.httpService = axios.create({
      baseURL: 'https://companies.twenty.com',
    });
  }

  async createCompanies(
    domainNames: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<{
    [domainName: string]: string;
  }> {
    const uniqueDomainNames = [...new Set(domainNames)];

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const existingCompanies =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT id, "domainName" FROM ${dataSourceSchema}.company WHERE "domainName" = ANY($1)`,
        [uniqueDomainNames],
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
      companiesObject[domainName] = await this.createCompany(
        domainName,
        workspaceId,
        transactionManager,
      );
    }

    return companiesObject;
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
