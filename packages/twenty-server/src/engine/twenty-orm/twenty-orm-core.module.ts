import {
  DynamicModule,
  Global,
  Logger,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from '@nestjs/common/cache/cache.module-definition';

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
  private readonly logger = new Logger(TwentyORMCoreModule.name);

  static register(options: TwentyORMOptions): DynamicModule {
    const dynamicModule = super.register(options);
    const providers: Provider[] = [
      {
        provide: TWENTY_ORM_WORKSPACE_DATASOURCE,
        useFactory: async (
          entitySchemaFactory: EntitySchemaFactory,
          scopedWorkspaceDatasourceFactory: ScopedWorkspaceDatasourceFactory,
        ) => {
          const entities = options.objects.map((entityClass) =>
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
          const entities = options.objects.map((entityClass) =>
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
}
