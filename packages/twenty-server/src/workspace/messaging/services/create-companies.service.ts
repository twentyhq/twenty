import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';

import { capitalize } from 'src/utils/capitalize';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
@Injectable()
export class CreateCompaniesService {
  constructor() {}

  async createCompanyFromDomainName(
    domainName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ) {
    const companyName = capitalize(domainName.split('.')[0]);

    const companyId = v4();

    const existingCompany = await manager.query(
      `SELECT * FROM ${dataSourceMetadata.schema}.company WHERE "domainName" = '${domainName}'`,
    );

    if (existingCompany.length > 0) {
      return existingCompany[0].id;
    }

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.company (id, name, "domainName")
      VALUES ($1, $2, $3)`,
      [companyId, companyName, domainName],
    );

    return companyId;
  }
}
