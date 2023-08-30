import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/core/tenant/datasource/services/datasource.service';

import { CompanyEntity } from './company-v2.entity';

@Injectable()
export class CompanyV2Service {
  constructor(private readonly dataSourceService: DataSourceService) {}

  async findManyCompanyByWorkspaceId(workspaceId: string) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    return await workspaceDataSource
      ?.createQueryBuilder()
      .select('company')
      .from(CompanyEntity, 'company')
      .getMany();
  }

  async createOneCompanyForWorkspaceId(workspaceId: string, name: string) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    await workspaceDataSource
      ?.createQueryBuilder()
      .insert()
      .into(CompanyEntity)
      .values({ name })
      .execute();
  }
}
