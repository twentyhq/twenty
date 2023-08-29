import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/core/tenant/datasource/services/datasource.service';

@Injectable()
export class CompanyV2Service {
  constructor(private readonly dataSourceService: DataSourceService) {}

  async findManyCompanyByWorkspaceId(workspaceId: string) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const schemaName = this.dataSourceService.getSchemaName(workspaceId);
    return workspaceDataSource?.query(`SELECT * FROM ${schemaName}.companies`);
  }

  async createOneCompanyForWorkspaceId(workspaceId: string, name: string) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const schemaName = this.dataSourceService.getSchemaName(workspaceId);

    await workspaceDataSource?.query(`
        INSERT INTO ${schemaName}.companies (id, name)
        VALUES (gen_random_uuid(), '${name}');
      `);
  }
}
