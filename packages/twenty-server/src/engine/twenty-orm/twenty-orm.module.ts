import { DynamicModule, Global, Module } from '@nestjs/common';
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
import { TwentyORMService } from 'src/engine/twenty-orm/twenty-orm.service';
import { WorkspaceDatasourceFactory } from 'src/engine/twenty-orm/factories/workspace-datasource.factory';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';

@Global()
@Module({
  imports: [DataSourceModule],
  providers: [...entitySchemaFactories, TwentyORMService],
  exports: [TwentyORMService],
})
export class TwentyORMModule extends ConfigurableModuleClass {
  static register(options: TwentyORMOptions): DynamicModule {
    const dynamicModule = super.register(options);
    const providers = [
      {
        provide: TWENTY_ORM_WORKSPACE_DATASOURCE,
        useFactory: async (
          entitySchemaFactory: EntitySchemaFactory,
          workspaceDatasourceFactory: WorkspaceDatasourceFactory,
        ) => {
          const entities = options.objects.map((object) =>
            entitySchemaFactory.create(object),
          );

          const dataSource =
            await workspaceDatasourceFactory.createWorkspaceDatasource(
              entities,
            );

          return dataSource;
        },
        inject: [EntitySchemaFactory, WorkspaceDatasourceFactory],
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
    const providers = [
      {
        provide: TWENTY_ORM_WORKSPACE_DATASOURCE,
        useFactory: async (
          entitySchemaFactory: EntitySchemaFactory,
          workspaceDatasourceFactory: WorkspaceDatasourceFactory,
          options: TwentyORMOptions,
        ) => {
          const entities = options.objects.map((object) =>
            entitySchemaFactory.create(object),
          );

          const dataSource =
            await workspaceDatasourceFactory.createWorkspaceDatasource(
              entities,
            );

          return dataSource;
        },
        inject: [
          EntitySchemaFactory,
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
}
