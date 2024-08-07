import { Module } from '@nestjs/common';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { FieldMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/field-metadata/interceptors/field-metadata-graphql-api-exception.interceptor';
import { IsFieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-default-value.validator';
import { IsFieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-options.validator';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceStatusModule } from 'src/engine/workspace-manager/workspace-status/workspace-manager.module';
import { CreatedByPreQueryHook } from 'src/engine/metadata-modules/field-metadata/query-hooks/created-by.pre-query-hook';

import { FieldMetadataEntity } from './field-metadata.entity';
import { FieldMetadataService } from './field-metadata.service';

import { CreateFieldInput } from './dtos/create-field.input';
import { UpdateFieldInput } from './dtos/update-field.input';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
        WorkspaceMigrationModule,
        WorkspaceStatusModule,
        TwentyORMModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceCacheVersionModule,
        ObjectMetadataModule,
        DataSourceModule,
        TypeORMModule,
      ],
      services: [
        IsFieldMetadataDefaultValue,
        FieldMetadataService,
        CreatedByPreQueryHook,
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
          guards: [JwtAuthGuard],
          interceptors: [FieldMetadataGraphqlApiExceptionInterceptor],
        },
      ],
    }),
  ],
  providers: [
    IsFieldMetadataDefaultValue,
    IsFieldMetadataOptions,
    FieldMetadataService,
    FieldMetadataResolver,
  ],
  exports: [FieldMetadataService],
})
export class FieldMetadataModule {}
