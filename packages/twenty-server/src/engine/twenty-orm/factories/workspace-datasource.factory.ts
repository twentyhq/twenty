import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceDatasourceFactory {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  public async create(
    entities: EntitySchema[],
    workspaceId: string,
  ): Promise<WorkspaceDataSource | null> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
        workspaceId,
      );

    if (!dataSourceMetadata) {
      return null;
    }

    const workspaceDataSource = new WorkspaceDataSource(
      {
        workspaceId,
        workspaceCacheStorage: this.workspaceCacheStorageService,
      },
      {
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
      },
    );

    await workspaceDataSource.initialize();

    return workspaceDataSource;
  }
}
