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
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataValidationService } from 'src/engine/metadata-modules/field-metadata/field-metadata-validation.service';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { FieldMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/field-metadata/interceptors/field-metadata-graphql-api-exception.interceptor';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/relation/field-metadata-relation.service';
import { FieldMetadataRelatedRecordsService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-related-records.service';
import { IsFieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-default-value.validator';
import { IsFieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-options.validator';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { ViewModule } from 'src/modules/view/view.module';

import { FieldMetadataEntity } from './field-metadata.entity';
import { FieldMetadataService } from './field-metadata.service';

import { CreateFieldInput } from './dtos/create-field.input';
import { UpdateFieldInput } from './dtos/update-field.input';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [FieldMetadataEntity, ObjectMetadataEntity],
          'metadata',
        ),
        WorkspaceMigrationModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceMetadataVersionModule,
        WorkspaceCacheStorageModule,
        FeatureFlagModule,
        ObjectMetadataModule,
        DataSourceModule,
        TypeORMModule,
        ActorModule,
        ViewModule,
        PermissionsModule,
      ],
      services: [
        IsFieldMetadataDefaultValue,
        FieldMetadataService,
        FieldMetadataRelatedRecordsService,
        FieldMetadataValidationService,
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
    FieldMetadataRelationService,
    FieldMetadataRelatedRecordsService,
    FieldMetadataResolver,
  ],
  exports: [
    FieldMetadataService,
    FieldMetadataRelationService,
    FieldMetadataRelatedRecordsService,
  ],
})
export class FieldMetadataModule {}
