import {
  DynamicModule,
  Global,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  TwentyORMModuleAsyncOptions,
  TwentyORMOptions,
} from 'src/engine/twenty-orm/interfaces/twenty-orm-options.interface';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { LoadServiceWithWorkspaceContext } from 'src/engine/twenty-orm/context/load-service-with-workspace.context';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { entitySchemaFactories } from 'src/engine/twenty-orm/factories';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { CacheManager } from 'src/engine/twenty-orm/storage/cache-manager.storage';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConfigurableModuleClass } from 'src/engine/twenty-orm/twenty-orm.module-definition';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

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
    TwentyORMGlobalManager,
    LoadServiceWithWorkspaceContext,
  ],
  exports: [
    EntitySchemaFactory,
    TwentyORMManager,
    LoadServiceWithWorkspaceContext,
    TwentyORMGlobalManager,
  ],
})
export class TwentyORMCoreModule
  extends ConfigurableModuleClass
  implements OnApplicationShutdown
{
  private static readonly logger = new Logger(TwentyORMCoreModule.name);

  static register(options: TwentyORMOptions): DynamicModule {
    const dynamicModule = super.register(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? [])],
      exports: [...(dynamicModule.exports ?? [])],
    };
  }

  static registerAsync(
    asyncOptions: TwentyORMModuleAsyncOptions,
  ): DynamicModule {
    const dynamicModule = super.registerAsync(asyncOptions);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? [])],
      exports: [...(dynamicModule.exports ?? [])],
    };
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
