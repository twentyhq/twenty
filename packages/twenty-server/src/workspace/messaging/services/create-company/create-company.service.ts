import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { v4 } from 'uuid';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { capitalize } from 'src/utils/capitalize';
@Injectable()
export class CreateCompanyService {
  private readonly httpService: AxiosInstance;

  constructor() {
    this.httpService = axios.create({
      baseURL: 'https://companies.twenty.com',
    });
  }

  async createCompanies(
    domainNames: string[],
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<{
    [domainName: string]: string;
  }> {
    const uniqueDomainNames = [...new Set(domainNames)];

    const existingCompanies = await manager.query(
      `SELECT id, "domainName" FROM ${dataSourceMetadata.schema}.company WHERE "domainName" = ANY($1)`,
      [uniqueDomainNames],
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
        dataSourceMetadata,
        manager,
      );
    }

    return companiesObject;
  }

  async createCompany(
    domainName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<string> {
    const companyId = v4();

    const { name, city } = await this.getCompanyInfoFromDomainName(domainName);

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.company (id, name, "domainName", address)
      VALUES ($1, $2, $3, $4)`,
      [companyId, name, domainName, city],
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
