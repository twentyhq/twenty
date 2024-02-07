import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';

import { capitalize } from 'src/utils/capitalize';
import { WorkspaceQueryRunnerService } from 'src/workspace/workspace-query-runner/workspace-query-runner.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
@Injectable()
export class CreateCompaniesService {
  constructor(
    private readonly workspaceQueryRunnunerService: WorkspaceQueryRunnerService,
  ) {}

  async createCompanyFromDomainName(
    domainName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ) {
    const companyName = capitalize(domainName.split('.')[0]);

    const companyId = v4();

    const existingCompany = await manager.query(
      `SELECT * FROM company WHERE domain_name = '${domainName}'`,
    );

    if (existingCompany.length > 0) {
      return;
    }

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.company (id, name, domain_name)
      VALUES ($1, $2, $3)`,
      [companyId, companyName, domainName],
    );

    return companyId;
  }
}
