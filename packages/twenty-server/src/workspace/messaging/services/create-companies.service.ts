import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';
import axios, { AxiosInstance } from 'axios';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { capitalize } from 'src/utils/capitalize';
@Injectable()
export class CreateCompaniesService {
  private readonly httpService: AxiosInstance;

  constructor() {
    this.httpService = axios.create({
      baseURL: 'https://companies.twenty.com/',
    });
  }

  async createCompanyFromDomainName(
    domainName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ) {
    const companyId = v4();

    const existingCompany = await manager.query(
      `SELECT * FROM ${dataSourceMetadata.schema}.company WHERE "domainName" = '${domainName}'`,
    );

    if (existingCompany.length > 0) {
      return existingCompany[0].id;
    }

    const { name, city } = await this.getCompanyInfoFromDomainName(domainName);

    const companyNameFromDomainName = capitalize(domainName.split('.')[0]);

    const companyName = name || companyNameFromDomainName;

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.company (id, name, "domainName", address)
      VALUES ($1, $2, $3)`,
      [companyId, companyName, domainName, city],
    );

    return companyId;
  }

  async getCompanyInfoFromDomainName(domainName: string): Promise<{
    name: string;
    city: string;
  }> {
    const response = await this.httpService.get(`/${domainName}`);

    const data = response.data;

    return {
      name: data.name,
      city: data.city,
    };
  }
}
