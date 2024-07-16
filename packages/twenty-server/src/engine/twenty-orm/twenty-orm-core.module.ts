import {
  DynamicModule,
  Global,
  Logger,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  TwentyORMModuleAsyncOptions,
  TwentyORMOptions,
} from 'src/engine/twenty-orm/interfaces/twenty-orm-options.interface';

import { entitySchemaFactories } from 'src/engine/twenty-orm/factories';
import { TWENTY_ORM_WORKSPACE_DATASOURCE } from 'src/engine/twenty-orm/twenty-orm.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from 'src/engine/twenty-orm/twenty-orm.module-definition';
import { LoadServiceWithWorkspaceContext } from 'src/engine/twenty-orm/context/load-service-with-workspace.context';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { CacheManager } from 'src/engine/twenty-orm/storage/cache-manager.storage';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

export const workspaceDataSourceCacheInstance =
  new CacheManager<WorkspaceDataSource>();

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    DataSourceModule,
    WorkspaceCacheVersionModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [
    ...entitySchemaFactories,
    TwentyORMManager,
    LoadServiceWithWorkspaceContext,
  ],
  exports: [
    EntitySchemaFactory,
    TwentyORMManager,
    LoadServiceWithWorkspaceContext,
  ],
})
export class TwentyORMCoreModule
  extends ConfigurableModuleClass
  implements OnApplicationShutdown
{
  private static readonly logger = new Logger(TwentyORMCoreModule.name);

  static register(options: TwentyORMOptions): DynamicModule {
    const dynamicModule = super.register(options);

    // TODO: Avoid code duplication here
    const providers: Provider[] = [
      {
        provide: TWENTY_ORM_WORKSPACE_DATASOURCE,
        useFactory: this.createWorkspaceDataSource,
        inject: [
          WorkspaceCacheStorageService,
          getRepositoryToken(ObjectMetadataEntity, 'metadata'),
          EntitySchemaFactory,
          ScopedWorkspaceContextFactory,
          WorkspaceDatasourceFactory,
        ],
      },
    ];

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), ...providers],
      exports: [
        ...(dynamicModule.exports ?? []),
        TWENTY_ORM_WORKSPACE_DATASOURCE,
      ],
    };
  }

  static registerAsync(
    asyncOptions: TwentyORMModuleAsyncOptions,
  ): DynamicModule {
    const dynamicModule = super.registerAsync(asyncOptions);
    const providers: Provider[] = [
      {
        provide: TWENTY_ORM_WORKSPACE_DATASOURCE,
        useFactory: this.createWorkspaceDataSource,
        inject: [
          WorkspaceCacheStorageService,
          getRepositoryToken(ObjectMetadataEntity, 'metadata'),
          EntitySchemaFactory,
          ScopedWorkspaceContextFactory,
          WorkspaceDatasourceFactory,
          MODULE_OPTIONS_TOKEN,
        ],
      },
    ];

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), ...providers],
      exports: [
        ...(dynamicModule.exports ?? []),
        TWENTY_ORM_WORKSPACE_DATASOURCE,
      ],
    };
  }

  static async createWorkspaceDataSource(
    workspaceCacheStorageService: WorkspaceCacheStorageService,
    objectMetadataRepository: Repository<ObjectMetadataEntity>,
    entitySchemaFactory: EntitySchemaFactory,
    scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    workspaceDataSourceFactory: WorkspaceDatasourceFactory,
    options?: TwentyORMOptions,
  ) {
    const { workspaceId, cacheVersion } =
      scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      return null;
    }

    console.log('workspaceId', workspaceId);
    console.log('cacheVersion', cacheVersion);

    return workspaceDataSourceCacheInstance.execute(
      `${workspaceId}-${cacheVersion}`,
      async () => {
        let objectMetadataCollection =
          await workspaceCacheStorageService.getObjectMetadataCollection(
            workspaceId,
          );

        if (!objectMetadataCollection) {
          objectMetadataCollection = await objectMetadataRepository.find({
            where: { workspaceId },
            relations: [
              'fields.object',
              'fields',
              'fields.fromRelationMetadata',
              'fields.toRelationMetadata',
              'fields.fromRelationMetadata.toObjectMetadata',
            ],
          });

          await workspaceCacheStorageService.setObjectMetadataCollection(
            workspaceId,
            objectMetadataCollection,
          );
        }

        const entities = await Promise.all(
          objectMetadataCollection.map((objectMetadata) =>
            entitySchemaFactory.create(workspaceId, objectMetadata),
          ),
        );

        const workspaceDataSource = await workspaceDataSourceFactory.create(
          entities,
          workspaceId,
        );

        return workspaceDataSource;
      },
      (dataSource) => dataSource.destroy(),
    );
  }

  /**
   * Destroys all data sources on application shutdown
   */
  async onApplicationShutdown() {
    workspaceDataSourceCacheInstance.clear((dataSource) =>
      dataSource.destroy(),
    );
  }
}
