import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspacePermissionsCacheStorageService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache-storage.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { GetDataFromCacheWithRecomputeService } from 'src/engine/workspace-cache-storage/services/get-data-from-cache-with-recompute.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const TWENTY_MINUTES_IN_MS = 120_000;

@Injectable()
export class GlobalWorkspaceDataSourceService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(GlobalWorkspaceDataSourceService.name);
  private globalWorkspaceDataSource: GlobalWorkspaceDataSource | null = null;

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspacePermissionsCacheStorageService: WorkspacePermissionsCacheStorageService,
    private readonly workspaceFeatureFlagsMapCacheService: WorkspaceFeatureFlagsMapCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly getFromCacheWithRecomputeService: GetDataFromCacheWithRecomputeService<
      string,
      ObjectsPermissionsByRoleId
    >,
  ) {}

  async onModuleInit(): Promise<void> {
    this.globalWorkspaceDataSource = new GlobalWorkspaceDataSource(
      {
        url: this.twentyConfigService.get('PG_DATABASE_URL'),
        type: 'postgres',
        logging: this.twentyConfigService.getLoggingConfig(),
        entities: [],
        ssl: this.twentyConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
        extra: {
          query_timeout: 10000,
          idleTimeoutMillis: TWENTY_MINUTES_IN_MS,
          max: 4,
          allowExitOnIdle: true,
        },
      },
      this.workspaceEventEmitter,
      this.entitySchemaFactory,
    );

    await this.globalWorkspaceDataSource.initialize();
  }

  public getGlobalWorkspaceDataSource(): GlobalWorkspaceDataSource {
    if (!this.globalWorkspaceDataSource) {
      throw new Error(
        'GlobalWorkspaceDataSource has not been initialized. Make sure the module has been initialized.',
      );
    }

    return this.globalWorkspaceDataSource;
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.globalWorkspaceDataSource) {
      await this.globalWorkspaceDataSource.destroy();
      this.globalWorkspaceDataSource = null;
    }
  }
}
