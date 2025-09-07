import { Module } from '@nestjs/common';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CoreViewModule } from 'src/engine/core-modules/view/view.module';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { BeforeUpdateOneField } from 'src/engine/metadata-modules/field-metadata/hooks/before-update-one-field.hook';
import { FieldMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/field-metadata/interceptors/field-metadata-graphql-api-exception.interceptor';
import { FieldMetadataEnumValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-enum-validation.service';
import { FieldMetadataMorphRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-morph-relation.service';
import { FieldMetadataRelatedRecordsService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-related-records.service';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';
import { FieldMetadataValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-validation.service';
import { FieldMetadataServiceV2 } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service-v2';
import { IsFieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-default-value.validator';
import { IsFieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-options.validator';
import { FlatFieldMetadataModule } from 'src/engine/metadata-modules/flat-field-metadata/flat-field-metadata.module';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

import { FieldMetadataEntity } from './field-metadata.entity';

import { CreateFieldInput } from './dtos/create-field.input';
import { UpdateFieldInput } from './dtos/update-field.input';
import { FieldMetadataService } from './services/field-metadata.service';

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
        FeatureFlagModule,
        CoreViewModule,
        PermissionsModule,
        WorkspaceMetadataCacheModule,
        WorkspaceMigrationV2Module,
        FlatFieldMetadataModule,
        IndexMetadataModule,
      ],
      services: [
        IsFieldMetadataDefaultValue,
        FieldMetadataService,
        FieldMetadataServiceV2,
        FieldMetadataRelatedRecordsService,
        FieldMetadataMorphRelationService,
        FieldMetadataRelationService,
        FieldMetadataValidationService,
        FieldMetadataEnumValidationService,
      ],
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
            // Manually created because of the async validation
            one: { disabled: true },
            many: { disabled: true },
          },
          update: {
            // Manually created because of the async validation
            one: { disabled: true },
            many: { disabled: true },
          },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
          interceptors: [FieldMetadataGraphqlApiExceptionInterceptor],
        },
      ],
    }),
  ],
  providers: [
    IsFieldMetadataDefaultValue,
    IsFieldMetadataOptions,
    FieldMetadataService,
    FieldMetadataServiceV2,
    FieldMetadataRelationService,
    FieldMetadataRelatedRecordsService,
    FieldMetadataMorphRelationService,
    FieldMetadataValidationService,
    FieldMetadataEnumValidationService,
    FieldMetadataResolver,
    BeforeUpdateOneField,
  ],
  exports: [
    FieldMetadataService,
    FieldMetadataServiceV2,
    FieldMetadataRelationService,
    FieldMetadataMorphRelationService,
    FieldMetadataRelatedRecordsService,
    FieldMetadataEnumValidationService,
    FieldMetadataValidationService,
  ],
})
export class FieldMetadataModule {}
