import {
  DynamicModule,
  Global,
  Logger,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';

import { importClassesFromDirectories } from 'typeorm/util/DirectoryExportedClassesLoader';
import { Logger as TypeORMLogger } from 'typeorm/logger/Logger';

import {
  TwentyORMModuleAsyncOptions,
  TwentyORMOptions,
} from 'src/engine/twenty-orm/interfaces/twenty-orm-options.interface';

import { entitySchemaFactories } from 'src/engine/twenty-orm/factories';
import { TWENTY_ORM_WORKSPACE_DATASOURCE } from 'src/engine/twenty-orm/twenty-orm.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { DataSourceStorage } from 'src/engine/twenty-orm/storage/data-source.storage';
import { ScopedWorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-datasource.factory';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { splitClassesAndStrings } from 'src/engine/twenty-orm/utils/split-classes-and-strings.util';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from 'src/engine/twenty-orm/twenty-orm.module-definition';

@Global()
@Module({
  imports: [DataSourceModule],
  providers: [...entitySchemaFactories, TwentyORMManager],
  exports: [EntitySchemaFactory, TwentyORMManager],
})
export class TwentyORMCoreModule
  extends ConfigurableModuleClass
  implements OnApplicationShutdown
{
  private static readonly logger = new Logger(TwentyORMCoreModule.name);

  static register(options: TwentyORMOptions): DynamicModule {
    const dynamicModule = super.register(options);

    const providers: Provider[] = [
      {
        provide: TWENTY_ORM_WORKSPACE_DATASOURCE,
        useFactory: async (
          entitySchemaFactory: EntitySchemaFactory,
          scopedWorkspaceDatasourceFactory: ScopedWorkspaceDatasourceFactory,
        ) => {
          const workspaceEntities = await this.loadEntities(
            options.workspaceEntities,
          );

          const entities = workspaceEntities.map((entityClass) =>
            entitySchemaFactory.create(entityClass),
          );

          const scopedWorkspaceDataSource =
            await scopedWorkspaceDatasourceFactory.create(entities);

          return scopedWorkspaceDataSource;
        },
        inject: [EntitySchemaFactory, ScopedWorkspaceDatasourceFactory],
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
        useFactory: async (
          entitySchemaFactory: EntitySchemaFactory,
          scopedWorkspaceDatasourceFactory: ScopedWorkspaceDatasourceFactory,
          options: TwentyORMOptions,
        ) => {
          const workspaceEntities = await this.loadEntities(
            options.workspaceEntities,
          );

          const entities = workspaceEntities.map((entityClass) =>
            entitySchemaFactory.create(entityClass),
          );

          const scopedWorkspaceDataSource =
            await scopedWorkspaceDatasourceFactory.create(entities);

          return scopedWorkspaceDataSource;
        },
        inject: [
          EntitySchemaFactory,
          ScopedWorkspaceDatasourceFactory,
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

  /**
   * Destroys all data sources on application shutdown
   */
  async onApplicationShutdown() {
    const dataSources = DataSourceStorage.getAllDataSources();

    for (const dataSource of dataSources) {
      try {
        if (dataSource && dataSource.isInitialized) {
          await dataSource.destroy();
        }
      } catch (e) {
        this.logger.error(e?.message);
      }
    }
  }

  private static async loadEntities(
    workspaceEntities: (Type<BaseWorkspaceEntity> | string)[],
  ): Promise<Type<BaseWorkspaceEntity>[]> {
    const [entityClassesOrSchemas, entityDirectories] = splitClassesAndStrings(
      workspaceEntities || [],
    );
    const importedEntities = await importClassesFromDirectories(
      // Only `log` function is used under importClassesFromDirectories function
      this.logger as unknown as TypeORMLogger,
      entityDirectories,
    );
    const entities = [
      ...entityClassesOrSchemas,
      ...(importedEntities as Type<BaseWorkspaceEntity>[]),
    ];

    return entities.filter(
      (entity) =>
        // Filter out CustomWorkspaceEntity as it's a partial entity handled separately
        entity.name !== CustomWorkspaceEntity.name &&
        // Filter out BaseWorkspaceEntity as it's a base entity and should not be included in the workspace entities
        entity.name !== BaseWorkspaceEntity.name,
    );
  }
}
