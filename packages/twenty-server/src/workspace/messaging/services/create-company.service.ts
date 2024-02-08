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

  async createCompanyFromDomainName(
    domainName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<string> {
    const existingCompany = await manager.query(
      `SELECT * FROM ${dataSourceMetadata.schema}.company WHERE "domainName" = '${domainName}'`,
    );

    if (existingCompany.length > 0) {
      return existingCompany[0].id;
    }

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
