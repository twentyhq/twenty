import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/object-metadata/interceptors/object-metadata-graphql-api-exception.interceptor';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataResolver } from 'src/engine/metadata-modules/object-metadata/object-metadata.resolver';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RemoteTableRelationsModule } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        TypeORMModule,
        NestjsQueryTypeOrmModule.forFeature([
          ObjectMetadataEntity,
          FieldMetadataEntity,
        ]),
        TypeOrmModule.forFeature([FeatureFlagEntity, ViewEntity]),
        ApplicationModule,
        DataSourceModule,
        WorkspaceMigrationModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceMetadataVersionModule,
        RemoteTableRelationsModule,
        IndexMetadataModule,
        PermissionsModule,
        WorkspaceCacheStorageModule,
        WorkspaceDataSourceModule,
        FeatureFlagModule,
        WorkspaceMigrationV2Module,
        ViewModule,
        ViewFieldModule,
        WorkspaceManyOrAllFlatEntityMapsCacheModule,
        WorkspaceCacheModule,
      ],
      services: [
        ObjectMetadataService,
        FlatFieldMetadataValidatorService,
        FlatFieldMetadataTypeValidatorService,
      ],
      resolvers: [
        {
          EntityClass: ObjectMetadataEntity,
          DTOClass: ObjectMetadataDTO,
          CreateDTOClass: CreateObjectInput,
          UpdateDTOClass: UpdateObjectPayload,
          ServiceClass: ObjectMetadataService,
          pagingStrategy: PagingStrategies.CURSOR,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
          },
          create: {
            disabled: true,
          },
          update: { disabled: true },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
          interceptors: [ObjectMetadataGraphqlApiExceptionInterceptor],
          filters: [PermissionsGraphqlApiExceptionFilter],
        },
      ],
    }),
  ],
  providers: [
    ObjectMetadataService,
    ObjectMetadataResolver,
    ObjectMetadataToolsFactory,
  ],
  exports: [ObjectMetadataService, ObjectMetadataToolsFactory],
})
export class ObjectMetadataModule {}
