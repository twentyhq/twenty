import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { CoreViewModule } from 'src/engine/core-modules/view/view.module';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatObjectMetadataValidatorService } from 'src/engine/metadata-modules/flat-object-metadata/services/flat-object-metadata-validator.service';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { BeforeUpdateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-update-one-object.hook';
import { ObjectMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/object-metadata/interceptors/object-metadata-graphql-api-exception.interceptor';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataResolver } from 'src/engine/metadata-modules/object-metadata/object-metadata.resolver';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectMetadataFieldRelationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service';
import { ObjectMetadataMigrationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-migration.service';
import { ObjectMetadataRelatedRecordsService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-related-records.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RemoteTableRelationsModule } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.module';
import { SearchVectorModule } from 'src/engine/metadata-modules/search-vector/search-vector.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
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
        TypeOrmModule.forFeature([FeatureFlag, ViewEntity]),
        DataSourceModule,
        WorkspaceMigrationModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceMetadataVersionModule,
        RemoteTableRelationsModule,
        SearchVectorModule,
        IndexMetadataModule,
        PermissionsModule,
        WorkspacePermissionsCacheModule,
        WorkspaceCacheStorageModule,
        WorkspaceMetadataCacheModule,
        WorkspaceDataSourceModule,
        FeatureFlagModule,
        WorkspaceMigrationV2Module,
        CoreViewModule,
      ],
      services: [
        ObjectMetadataService,
        ObjectMetadataServiceV2,
        FlatObjectMetadataValidatorService,
        FlatFieldMetadataValidatorService,
        FlatFieldMetadataTypeValidatorService,
        ObjectMetadataMigrationService,
        ObjectMetadataFieldRelationService,
        ObjectMetadataRelatedRecordsService,
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
            many: { disabled: true },
            guards: [SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL)],
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
    ObjectMetadataServiceV2,
    ObjectMetadataResolver,
    BeforeUpdateOneObject,
  ],
  exports: [ObjectMetadataService],
})
export class ObjectMetadataModule {}
