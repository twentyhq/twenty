import { Module } from '@nestjs/common';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatFieldMetadataModule } from 'src/engine/metadata-modules/flat-field-metadata/flat-field-metadata.module';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewGroupModule } from 'src/engine/metadata-modules/view-group/view-group.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';
import { FieldMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/field-metadata/interceptors/field-metadata-graphql-api-exception.interceptor';
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';

import { FieldMetadataEntity } from './field-metadata.entity';

import { CreateFieldInput } from './dtos/create-field.input';
import { UpdateFieldInput } from './dtos/update-field.input';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([
          FieldMetadataEntity,
          ObjectMetadataEntity,
        ]),
        WorkspaceMigrationModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceMetadataVersionModule,
        WorkspaceCacheStorageModule,
        ObjectMetadataModule,
        DataSourceModule,
        TypeORMModule,
        ActorModule,
        ApplicationModule,
        FeatureFlagModule,
        ViewModule,
        ViewFieldModule,
        ViewFilterModule,
        ViewGroupModule,
        PermissionsModule,
        WorkspaceMigrationV2Module,
        FlatFieldMetadataModule,
        IndexMetadataModule,
        WorkspaceManyOrAllFlatEntityMapsCacheModule,
      ],
      services: [FieldMetadataService],
      resolvers: [
        {
          EntityClass: FieldMetadataEntity,
          DTOClass: FieldMetadataDTO,
          CreateDTOClass: CreateFieldInput,
          UpdateDTOClass: UpdateFieldInput,
          ServiceClass: FieldMetadataService,
          pagingStrategy: PagingStrategies.CURSOR,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
          },
          create: {
            disabled: true,
          },
          update: {
            disabled: true,
          },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
          interceptors: [FieldMetadataGraphqlApiExceptionInterceptor],
        },
      ],
    }),
  ],
  providers: [
    FieldMetadataService,
    FieldMetadataResolver,
    FieldMetadataToolsFactory,
  ],
  exports: [FieldMetadataService, FieldMetadataToolsFactory],
})
export class FieldMetadataModule {}
