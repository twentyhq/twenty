import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { DataSourceStorage } from 'src/engine/twenty-orm/storage/data-source.storage';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';

@Injectable()
export class WorkspaceDatasourceFactory {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  public async create(
    entities: EntitySchema[],
    workspaceId: string,
  ): Promise<WorkspaceDataSource | null> {
    const storedWorkspaceDataSource =
      DataSourceStorage.getDataSource(workspaceId);

    if (storedWorkspaceDataSource) {
      return storedWorkspaceDataSource;
    }

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
        workspaceId,
      );

    if (!dataSourceMetadata) {
      return null;
    }

    const workspaceDataSource = new WorkspaceDataSource({
      url:
        dataSourceMetadata.url ??
        this.environmentService.get('PG_DATABASE_URL'),
      type: 'postgres',
      logging: this.environmentService.get('DEBUG_MODE')
        ? ['query', 'error']
        : ['error'],
      schema: dataSourceMetadata.schema,
      entities,
      ssl: this.environmentService.get('PG_SSL_ALLOW_SELF_SIGNED')
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });

    await workspaceDataSource.initialize();

    DataSourceStorage.setDataSource(workspaceId, workspaceDataSource);

    return workspaceDataSource;
  }
}
